import { TestCases } from "./testCases";

export type SubmissionPayload = {
  id: string;
  problemId: string;
  code: string;
  language: string;
  testCases: TestCases;
};
