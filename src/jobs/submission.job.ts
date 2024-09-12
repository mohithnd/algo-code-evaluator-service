import { Job } from "bullmq";

import resultProducer from "../producers/result.producer";
import { IJob } from "../types/bullmq.jobDefinition";
import { SubmissionPayload } from "../types/submissionPayload";
import createExecutor from "../utils/executorFactory";

export default class SubmissionJob implements IJob {
  name: string;
  payload: SubmissionPayload;

  constructor(payload: SubmissionPayload) {
    this.payload = payload;
    this.name = this.constructor.name;
  }

  handle = async (job?: Job) => {
    console.log("Handler of The Submission Job Called");

    if (job) {
      console.log("Job data:", job.data);
      const strategy = createExecutor(this.payload.language);

      const inputCases = this.payload.testCases.map((ele) => ele.input);
      const outputCases = this.payload.testCases.map((ele) => ele.output);

      console.log("Input cases:", inputCases);
      console.log("Output cases:", outputCases);

      if (strategy) {
        const response = await strategy.execute(
          this.payload.code,
          inputCases,
          outputCases
        );

        if (response.status === "COMPLETED") {
          console.log("Code Executed Successfully");
          await resultProducer({
            id: this.payload.id,
            stdout: response.output,
            stderr: "",
          });
        } else {
          console.log("Something Went Wrong With Code Execution");
          await resultProducer({
            id: this.payload.id,
            stdout: "",
            stderr: response.output,
          });
        }
        console.log("Execution response:", response);
      }
    }
  };

  failed = (job?: Job): void => {
    console.log("Submission Job Failed:");
    if (job) {
      console.log("Failed job ID:", job.id);
    }
  };
}
