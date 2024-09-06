import serverConfig from "../config/server.config";
import createContainer from "../containers/containerFactory";
import { fetchDecodedStream } from "../containers/dockerHelper";
import isImagePresent from "../containers/isImagePresent";
import pullImage from "../containers/pullImage";
import CodeExecutorStrategy, {
  ExecutionResponse,
} from "../types/codeExecutorStrategy";

class PythonExecutor implements CodeExecutorStrategy {
  async execute(
    code: string,
    inputTestCases: string[],
    outputTestCases: string[]
  ): Promise<ExecutionResponse> {
    const rawLogBuffer: Buffer[] = [];

    console.log(outputTestCases);

    inputTestCases.unshift(`${inputTestCases.length}`);

    console.log("Initialising A New Python Docker Container");

    const escapedCode = code.replace(/'/g, `'\\"'`);
    const escapedInputs = inputTestCases.join(" ").replace(/'/g, `'\\"'`);
    const runCommand = `echo '${escapedCode}' > main.py && echo '${escapedInputs}' | python3 main.py`;

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
      await pythonDockerContainer.remove({
        force: true,
      });
    }
  }
}

export default PythonExecutor;
