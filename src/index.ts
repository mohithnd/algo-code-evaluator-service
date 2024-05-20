import express, { Express } from "express";

import bullBoardAdapter from "./config/bullBoard.config";
import serverConfig from "./config/server.config";
import runPython from "./containers/runPythonDocker";
import sampleQueueProducer from "./producers/sample.producer";
import apiRouter from "./routes";
import sampleWorker from "./workers/sample.worker";

const app: Express = express();

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

app.use("/api", apiRouter);

app.use("/queues", bullBoardAdapter.getRouter());

app.listen(serverConfig.PORT, () => {
  console.log(`Server Is Running On Port: ${serverConfig.PORT}`);
  console.log(
    `BullBoard Dashboard Is Running On: http://localhost:${serverConfig.PORT}/queues`
  );

  sampleWorker("SampleQueue");

  const code = `x = input()
y = input()
print("value of x is", x)
print("value of y is", y)
`;

  const inputCase = `100
200
`;

  runPython(code, inputCase);

  sampleQueueProducer(
    "SampleJob",
    {
      name: "Sarthak",
      company: "Razorpay",
      position: "PM-2",
      location: "BLR",
    },
    2
  );
  sampleQueueProducer(
    "SampleJob",
    {
      name: "Sanket",
      company: "Microsoft",
      position: "SDE-2",
      location: "Remote",
    },
    1
  );
});
