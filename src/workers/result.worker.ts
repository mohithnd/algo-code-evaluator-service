import { Job, Worker } from "bullmq";

import redisConnection from "../config/redis.config";
import ResultJob from "../jobs/result.job";

export default function resultWorker(queueName: string) {
  new Worker(
    queueName,
    async (job: Job) => {
      if (job.name === "ResultJob") {
        const resultJobInstance = new ResultJob(job.data);
        resultJobInstance.handle(job);
        return true;
      }
    },
    {
      connection: redisConnection,
    }
  );
}
