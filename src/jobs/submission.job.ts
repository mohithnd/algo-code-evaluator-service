import { Job } from "bullmq";

import resultProducer from "../producers/result.producer";
import { IJob } from "../types/bullmq.jobDefinition";
import { SubmissionPayload } from "../types/submissionPayload";
import codeCreator from "../utils/codeCreator";
import createExecutor from "../utils/executorFactory";
import fetchCodeStubs from "../utils/fetchCodeStubs";

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
      const strategy = createExecutor(this.payload.language);
      const problem = await fetchCodeStubs(this.payload.problemId, this.name);

      if (strategy && problem) {
        const response = await strategy.execute(
          codeCreator(problem.start, this.payload.code, problem.end),
          this.payload.inputCases
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
        console.log(response);
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
