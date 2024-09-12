import { Job, Worker } from "bullmq";

import redisConnection from "../config/redis.config";
import SubmissionJob from "../jobs/submission.job";

export default function submissionWorker(queueName: string) {
  console.log(`Starting worker for queue: ${queueName}`);
  return new Worker(
    queueName,
    async (job: Job) => {
      console.log(`Processing job: ${job.id} of type: ${job.name}`);
      if (job.name === "SubmissionJob") {
        const submissionJobInstance = new SubmissionJob(job.data);
        await submissionJobInstance.handle(job);
        console.log(`Job ${job.id} processed successfully.`);
        return true;
      }
    },
    {
      connection: redisConnection,
    }
  );
}
