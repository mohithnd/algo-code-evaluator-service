import { Job } from "bullmq";

import runCpp from "../containers/runCPPDocker";
import runJava from "../containers/runJavaDocker";
import runNodeJS from "../containers/runNodeJSDocker";
import runPython from "../containers/runPythonDocker";
import resultQueueProducer from "../producers/result.producer";
import { IJob } from "../types/bullmq.jobDefinition";
import { SubmissionPayload } from "../types/submissionPayload";

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
      console.log(this.payload.language);

      if (this.payload.language === "CPP") {
        const response = await runCpp(
          this.payload.code,
          this.payload.inputCase
        );

        console.log("Evaluation Response:-", response);

        resultQueueProducer({ id: this.payload.id, ...response });
      } else if (this.payload.language === "JAVA") {
        const response = await runJava(
          this.payload.code,
          this.payload.inputCase
        );

        console.log("Evaluation Response:-", response);

        resultQueueProducer({ id: this.payload.id, ...response });
      } else if (this.payload.language === "PYTHON") {
        const response = await runPython(
          this.payload.code,
          this.payload.inputCase
        );

        console.log("Evaluation Response:-", response);

        resultQueueProducer({ id: this.payload.id, ...response });
      } else if (this.payload.language === "NODEJS") {
        const response = await runNodeJS(
          this.payload.code,
          this.payload.inputCase
        );

        console.log("Evaluation Response:-", response);

        resultQueueProducer({ id: this.payload.id, ...response });
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
