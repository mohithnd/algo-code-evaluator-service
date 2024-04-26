import express, { Express } from "express";
import serverConfig from "./config/server.config";

const app: Express = express();

app.listen(serverConfig.PORT, () => {
  console.log(`Server Is Running On Port: ${serverConfig.PORT}`);
});
