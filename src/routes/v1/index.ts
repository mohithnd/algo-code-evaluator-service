import express from "express";

import { pingCheck } from "../../controllers/ping.controller";
import submissionRouter from "./submission.routes";

const v1Router = express.Router();

v1Router.use("/submissions", submissionRouter);

v1Router.get("/", pingCheck);

export default v1Router;
