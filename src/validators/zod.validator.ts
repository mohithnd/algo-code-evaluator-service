/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";

export const validate =
  (schema: ZodSchema<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        ...req.body,
      });
      next();
    } catch (err) {
      console.log(err);
      return res.status(400).json({
        success: false,
        message: "Invalid Request Params Received",
        data: {},
        error: err,
      });
    }
  };
