import express from "express";

const v1Router = express.Router();
import { pingCheck } from "../../controllers/ping.controller";

v1Router.get("/", pingCheck);

export default v1Router;
