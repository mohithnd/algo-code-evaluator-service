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
    console.log("Executing Python code...");

    inputTestCases.unshift(`${inputTestCases.length}`);
    console.log("Input test cases:", inputTestCases);
    console.log("Output test cases:", outputTestCases);

    const escapedCode = code.replace(/'/g, `'\\"'`);
    const escapedInputs = inputTestCases.join(" ").replace(/'/g, `'\\"'`);
    const runCommand = `echo '${escapedCode}' > main.py && echo '${escapedInputs}' | python3 main.py`;

    console.log("Run command:", runCommand);

    if (!(await isImagePresent(serverConfig.PYTHON_IMAGE))) {
      console.log("Python image not found, pulling image...");
      await pullImage(serverConfig.PYTHON_IMAGE);
    }

    const pythonDockerContainer = await createContainer(
      serverConfig.PYTHON_IMAGE,
      ["/bin/sh", "-c", runCommand]
    );

    await pythonDockerContainer.start();
    console.log("Started Python Docker Container");

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
      console.log("Execution response:", response);
      return { output: response, status: "COMPLETED" };
    } catch (err) {
      console.error("Execution error:", err);
      return { output: err as string, status: "ERROR" };
    } finally {
      await pythonDockerContainer.remove({ force: true });
      console.log("Python Docker Container removed");
    }
  }
}

export default PythonExecutor;
