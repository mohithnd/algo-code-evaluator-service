import resultQueue from "../queues/result.queue";
import { ResultPayload } from "../types/resultPayload";

export default async function (payload: ResultPayload) {
  console.log("Adding result to queue:", payload);
  await resultQueue.add("ResultJob", payload);
  console.log("Result added to queue successfully.");
}
