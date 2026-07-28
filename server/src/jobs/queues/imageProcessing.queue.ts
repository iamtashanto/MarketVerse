import { Queue } from "bullmq";
import { bullConnection, defaultJobOptions } from "@/jobs/queues/connection";

export interface ImageProcessingJobData {
  userId: string;
  objectKey: string;
}

/** See docs/BACKEND_ARCHITECTURE.md §19 — quarantine-then-verify upload pipeline. */
export const imageProcessingQueue = new Queue<ImageProcessingJobData>("image-processing", {
  connection: bullConnection,
  defaultJobOptions,
});
