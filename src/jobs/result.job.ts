import { Job } from "bullmq";

import { IJob } from "../types/bullmq.jobDefinition";
import { ResultPayload } from "../types/resultPayload";

export default class ResultJob implements IJob {
  name: string;
  payload: Record<string, ResultPayload>;

  constructor(payload: Record<string, ResultPayload>) {
    this.payload = payload;
    this.name = this.constructor.name;
  }

  handle = async (job?: Job) => {
    console.log("Handler of The Result Job Called");

    if (job) {
      console.log(this.payload);
    }
  };

  failed = (job?: Job): void => {
    console.log("Result Job Failed:-");

    if (job) {
      console.log(job.id);
    }
  };
}
