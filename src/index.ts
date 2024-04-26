import express, { Express } from "express";

import serverConfig from "./config/server.config";
import apiRouter from "./routes";

const app: Express = express();

app.use(express.json());
app.use(express.text());
app.use(express.urlencoded({ extended: true }));

app.use("/api", apiRouter);

app.listen(serverConfig.PORT, () => {
  console.log(`Server Is Running On Port: ${serverConfig.PORT}`);
});
