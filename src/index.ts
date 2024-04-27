import express, { Express } from "express";

import serverConfig from "./config/server.config";
import sampleQueueProducer from "./producers/sample.producer";
import apiRouter from "./routes";
import sampleWorker from "./workers/sample.worker";

const app: Express = express();

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

app.use("/api", apiRouter);

app.listen(serverConfig.PORT, () => {
  console.log(`Server Is Running On Port: ${serverConfig.PORT}`);

  sampleWorker("SampleQueue");
  sampleQueueProducer("SampleJob", {
    name: "Mohit",
    company: "Microsoft",
    position: "SDE-2",
    location: "Remote",
  });
});
