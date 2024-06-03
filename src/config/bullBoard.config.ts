import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter";
import { ExpressAdapter } from "@bull-board/express";

import resultQueue from "../queues/result.queue";
import sampleQueue from "../queues/sample.queue";
import submissionQueue from "../queues/submission.queue";

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/queues");

createBullBoard({
  queues: [
    new BullMQAdapter(sampleQueue),
    new BullMQAdapter(submissionQueue),
    new BullMQAdapter(resultQueue),
  ],
  serverAdapter: serverAdapter,
});

export default serverAdapter;
