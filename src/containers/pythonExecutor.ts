import serverConfig from "../config/server.config";
import CodeExecutorStrategy, {
  ExecutionResponse,
} from "../types/codeExecutorStrategy";
import createContainer from "./containerFactory";
import { fetchDecodedStream } from "./dockerHelper";
import isImagePresent from "./isImagePresent";
import pullImage from "./pullImage";

class PythonExecutor implements CodeExecutorStrategy {
  async execute(
    code: string,
    inputTestCases: string[],
    outputTestCases: string[]
  ): Promise<ExecutionResponse> {
    const rawLogBuffer: Buffer[] = [];

    console.log(outputTestCases);

    console.log("Initialising A New Python Docker Container");

    const runCommand = `echo '${code.replace(
      /'/g,
      `'\\"`
    )}' > Solution.py && echo '${inputTestCases
      .join("")
      .replace(/'/g, `'\\"`)}' | python3 Solution.py`;

    console.log(runCommand);

    if (!(await isImagePresent(serverConfig.PYTHON_IMAGE))) {
      await pullImage(serverConfig.PYTHON_IMAGE);
    }

    const pythonDockerContainer = await createContainer(
      serverConfig.PYTHON_IMAGE,
      ["/bin/sh", "-c", runCommand]
    );

    await pythonDockerContainer.start();

    console.log("Started The Python Docker Container");

    const loggerStream = await pythonDockerContainer.logs({
      stdout: true,
      stderr: true,
      timestamps: false,
      follow: true,
    });

    loggerStream.on("data", (chunk) => {
      rawLogBuffer.push(chunk);
    });

    try {
      const response: string = await fetchDecodedStream(
        loggerStream,
        rawLogBuffer
      );

      return { output: response, status: "COMPLETED" };
    } catch (err) {
      return { output: err as string, status: "ERROR" };
    } finally {
      await pythonDockerContainer.remove();
    }
  }
}

export default PythonExecutor;
