import { Queue } from "bullmq";

import redisConnection from "../config/redis.config";

console.log("Initializing ResultQueue with Redis connection.");
export default new Queue("ResultQueue", {
  connection: redisConnection,
});
console.log("ResultQueue initialized.");
