import { Job } from "bullmq";

import runCpp from "../containers/runCPPDocker";
import { IJob } from "../types/bullmq.jobDefinition";
import { SubmissionPayload } from "../types/submissionPayload";

export default class SubmissionJob implements IJob {
  name: string;
  payload: Record<string, SubmissionPayload>;

  constructor(payload: Record<string, SubmissionPayload>) {
    this.payload = payload;
    this.name = this.constructor.name;
  }

  handle = async (job?: Job) => {
    console.log("Handler of The Submission Job Called");
    if (job) {
      const key = Object.keys(this.payload)[0];

      console.log(this.payload[key].language);

      if (this.payload[key].language === "CPP") {
        const response = await runCpp(
          this.payload[key].code,
          this.payload[key].inputCase
        );
        console.log("Evaluation Response:-", response);
      }
    }
  };

  failed = (job?: Job): void => {
    console.log("Submission Job Failed:-");
    if (job) {
      console.log(job.id);
    }
  };
}
