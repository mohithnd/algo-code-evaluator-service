import serverConfig from "../config/server.config";
import createContainer from "../containers/containerFactory";
import { fetchDecodedStream } from "../containers/dockerHelper";
import isImagePresent from "../containers/isImagePresent";
import pullImage from "../containers/pullImage";
import CodeExecutorStrategy, {
  ExecutionResponse,
} from "../types/codeExecutorStrategy";

class NodeJSExecutor implements CodeExecutorStrategy {
  async execute(
    code: string,
    inputTestCases: string[],
    outputTestCases: string[]
  ): Promise<ExecutionResponse> {
    const rawLogBuffer: Buffer[] = [];
    console.log("Executing NodeJS code...");

    inputTestCases.unshift(`${inputTestCases.length}`);
    console.log("Input test cases:", inputTestCases);
    console.log("Output test cases:", outputTestCases);

    const escapedCode = code.replace(/'/g, `'\\"'`);
    const escapedInputs = inputTestCases.join(" ").replace(/'/g, `'\\"'`);
    const runCommand = `echo '${escapedCode}' > main.js && echo '${escapedInputs}' | node main.js`;

    console.log("Run command:", runCommand);

    if (!(await isImagePresent(serverConfig.NODEJS_IMAGE))) {
      console.log("NodeJS image not found, pulling image...");
      await pullImage(serverConfig.NODEJS_IMAGE);
    }

    const nodejsDockerContainer = await createContainer(
      serverConfig.NODEJS_IMAGE,
      ["/bin/sh", "-c", runCommand]
    );

    await nodejsDockerContainer.start();
    console.log("Started NodeJS Docker Container");

    const loggerStream = await nodejsDockerContainer.logs({
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
      await nodejsDockerContainer.remove({ force: true });
      console.log("NodeJS Docker Container removed");
    }
  }
}

export default NodeJSExecutor;
