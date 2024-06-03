import submissionQueue from "../queues/submission.queue";
import { SubmissionPayload } from "../types/submissionPayload";

export default async function (payload: SubmissionPayload) {
  await submissionQueue.add("SubmissionJob", payload);
}
