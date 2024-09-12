import { Queue } from "bullmq";

import redisConnection from "../config/redis.config";

console.log("Initializing SubmissionQueue with Redis connection.");
export default new Queue("SubmissionQueue", {
  connection: redisConnection,
});
console.log("SubmissionQueue initialized.");
