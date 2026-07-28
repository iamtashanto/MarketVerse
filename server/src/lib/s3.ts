import { S3Client } from "@aws-sdk/client-s3";
import { env } from "@/config/env";

/** Works against any S3-compatible provider (AWS S3, Cloudflare R2, etc.) via S3_ENDPOINT. */
export const s3Client = new S3Client({
  region: env.S3_REGION,
  endpoint: env.S3_ENDPOINT,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY,
  },
});
