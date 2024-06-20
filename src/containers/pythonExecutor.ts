import CodeExecutorStrategy, {
  ExecutionResponse,
} from "../types/codeExecutorStrategy";
import { PYTHON_IMAGE } from "../utils/constants";
import createContainer from "./containerFactory";
import { fetchDecodedStream } from "./dockerHelper";
import isImagePresent from "./isImagePresent";
import pullImage from "./pullImage";

class PythonExecutor implements CodeExecutorStrategy {
  async execute(
    code: string,
    inputTestCases: string[]
  ): Promise<ExecutionResponse> {
    const rawLogBuffer: Buffer[] = [];

    console.log("Initialising A New Python Docker Container");

    const runCommand = `echo '${code.replace(
      /'/g,
      `'\\"`
    )}' > test.py && echo '${inputTestCases
      .join("")
      .replace(/'/g, `'\\"`)}' | python3 test.py`;

    console.log(runCommand);

    if (!(await isImagePresent(PYTHON_IMAGE))) {
      await pullImage(PYTHON_IMAGE);
    }

    // const pythonDockerContainer = await createContainer(PYTHON_IMAGE, [
    //   "python3",
    //   "-c",
    //   code,
    //   "stty -echo",
    // ]);

    const pythonDockerContainer = await createContainer(PYTHON_IMAGE, [
      "/bin/sh",
      "-c",
      runCommand,
    ]);

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
