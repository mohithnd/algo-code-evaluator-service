export default interface CodeExecutorStrategy {
  execute(
    code: string,
    inputTestCases: string[],
    outputTestCases: string[]
  ): Promise<ExecutionResponse>;
}

export type ExecutionResponse = {
  output: string;
  status: string;
};
