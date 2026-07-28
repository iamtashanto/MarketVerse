import { Worker, Job } from "bullmq";
import sharp from "sharp";
import { GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { bullConnection } from "@/jobs/queues/connection";
import { ImageProcessingJobData } from "@/jobs/queues/imageProcessing.queue";
import { s3Client } from "@/lib/s3";
import { env } from "@/config/env";
import { logger } from "@/lib/logger";

const VARIANTS = [
  { suffix: "thumbnail", width: 64 },
  { suffix: "medium", width: 512 },
];

/**
 * Verifies real file content (magic bytes via sharp — it throws on non-image
 * data regardless of declared Content-Type), strips EXIF, generates resized
 * variants, and promotes the object out of quarantine. A malicious or
 * malformed upload is never CDN-served. See docs/BACKEND_ARCHITECTURE.md §19.
 */
async function handler(job: Job<ImageProcessingJobData>): Promise<void> {
  const { objectKey } = job.data;

  const object = await s3Client.send(new GetObjectCommand({ Bucket: env.S3_BUCKET, Key: objectKey }));
  const buffer = Buffer.from(await object.Body!.transformToByteArray());

  const image = sharp(buffer).rotate(); // .rotate() with no args also normalizes EXIF orientation then strips it
  const metadata = await image.metadata();
  if (!metadata.width || !metadata.height) {
    throw new Error(`Rejected upload: not a valid image (${objectKey})`);
  }

  const promotedPrefix = objectKey.replace(/^quarantine\//, "public/");

  for (const variant of VARIANTS) {
    const resized = await image.clone().resize({ width: variant.width }).webp({ quality: 85 }).toBuffer();
    await s3Client.send(
      new PutObjectCommand({
        Bucket: env.S3_BUCKET,
        Key: `${promotedPrefix}-${variant.suffix}.webp`,
        Body: resized,
        ContentType: "image/webp",
      }),
    );
  }

  await s3Client.send(new DeleteObjectCommand({ Bucket: env.S3_BUCKET, Key: objectKey }));
  logger.info({ objectKey, promotedPrefix }, "Image processed and promoted out of quarantine");
}

export const imageProcessingWorker = new Worker<ImageProcessingJobData>("image-processing", handler, {
  connection: bullConnection,
  concurrency: 3,
});

imageProcessingWorker.on("failed", (job, err) => {
  logger.warn({ err, jobId: job?.id, objectKey: job?.data.objectKey }, "image-processing job failed");
});
