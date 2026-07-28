import { randomUUID } from "node:crypto";
import { PutObjectCommand, HeadObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3Client } from "@/lib/s3";
import { env } from "@/config/env";
import { ValidationError } from "@/common/errors/AppError";
import { imageProcessingQueue } from "@/jobs/queues/imageProcessing.queue";
import { PresignUploadDto } from "@/modules/uploads/uploads.validation";

const PRESIGN_EXPIRY_SECONDS = 60;

/**
 * Presigned-URL direct-to-object-storage pattern — the app server never
 * proxies file bytes. See docs/BACKEND_ARCHITECTURE.md §19.
 */
export class UploadsService {
  async createPresignedUpload(userId: bigint, dto: PresignUploadDto) {
    // Quarantine prefix — never served publicly/via CDN until the
    // verification worker (below) promotes it.
    const objectKey = `quarantine/${dto.purpose.toLowerCase()}/${userId}/${randomUUID()}`;

    const command = new PutObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: objectKey,
      ContentType: dto.contentType,
      ContentLength: dto.sizeBytes,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: PRESIGN_EXPIRY_SECONDS });
    return { uploadUrl, objectKey, expiresInSeconds: PRESIGN_EXPIRY_SECONDS };
  }

  async confirmUpload(userId: bigint, objectKey: string): Promise<{ status: "processing" }> {
    if (!objectKey.startsWith(`quarantine/`) || !objectKey.includes(`/${userId}/`)) {
      throw new ValidationError({ message: "Object key does not belong to this user" });
    }

    // Verify the object actually landed in S3 before trusting the client's claim.
    await s3Client.send(new HeadObjectCommand({ Bucket: env.S3_BUCKET, Key: objectKey }));

    // Real content-type verification (magic bytes), EXIF stripping, resizing,
    // and promotion out of quarantine all happen in the worker — never inline
    // on the request path. See jobs/workers/imageProcessing.worker.ts.
    await imageProcessingQueue.add("process", { userId: userId.toString(), objectKey });

    return { status: "processing" };
  }
}
