import resultQueue from "../queues/result.queue";
import { ResultPayload } from "../types/resultPayload";

export default async function (payload: ResultPayload) {
  await resultQueue.add("ResultJob", payload);
}
