import { Request, Response } from "express";
import { v4 as UUIDV4 } from "uuid";

import { CreateSubmissionDto } from "../dtos/createSubmission.dto";
import submissionQueueProducer from "../producers/submission.producer";

export function addSubmission(req: Request, res: Response) {
  const submissionDto = req.body as CreateSubmissionDto;

  const submissionId = UUIDV4();

  submissionQueueProducer({
    id: submissionId,
    problemId: submissionDto.problemId,
    language: submissionDto.language,
    code: submissionDto.code,
    testCases: submissionDto.testCases,
  });

  return res.status(201).json({
    success: true,
    error: {},
    message: "Successfully collected the submission",
    data: {
      submissionId,
    },
  });
}
