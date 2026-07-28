import multer from "multer";
import { ValidationError } from "@/common/errors/AppError";

const ALLOWED_MIME_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB — enforced again server-side and at the bucket policy

/**
 * Memory storage, small size cap — reserved for genuinely small/synchronous
 * uploads only (e.g. an admin support-ticket attachment). User-facing
 * avatar/store-branding uploads use the presigned-URL direct-to-S3 pattern
 * instead — see modules/uploads and docs/BACKEND_ARCHITECTURE.md §19.
 */
export const smallImageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE_BYTES },
  fileFilter: (_req, file, callback) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      callback(new ValidationError({ message: `Unsupported file type: ${file.mimetype}` }));
      return;
    }
    callback(null, true);
  },
});
