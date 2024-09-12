import express, { Express } from "express";

import bullBoardAdapter from "./config/bullBoard.config";
import connectToDB from "./config/db.config";
import serverConfig from "./config/server.config";
import submissionWorker from "./workers/submission.worker";

const app: Express = express();

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

app.use("/queues", bullBoardAdapter.getRouter());

app.listen(serverConfig.PORT, () => {
  connectToDB();
  console.log(`Server Is Running On Port: ${serverConfig.PORT}`);
  console.log(
    `BullBoard Dashboard Is Running On: http://localhost:${serverConfig.PORT}/queues`
  );
  submissionWorker("SubmissionQueue");
});
