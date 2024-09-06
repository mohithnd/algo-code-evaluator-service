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

    console.log(outputTestCases);

    inputTestCases.unshift(`${inputTestCases.length}`);

    console.log("Initialising A New Node.js Docker Container");

    const escapedCode = code.replace(/'/g, `'\\"'`);
    const escapedInputs = inputTestCases.join(" ").replace(/'/g, `'\\"'`);
    const runCommand = `echo '${escapedCode}' > main.js && echo '${escapedInputs}' | node main.js`;

    console.log(runCommand);

    if (!(await isImagePresent(serverConfig.NODEJS_IMAGE))) {
      await pullImage(serverConfig.NODEJS_IMAGE);
    }

    const nodejsDockerContainer = await createContainer(
      serverConfig.NODEJS_IMAGE,
      ["/bin/sh", "-c", runCommand]
    );

    await nodejsDockerContainer.start();

    console.log("Started The NodeJS Docker Container");

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

      return { output: response, status: "COMPLETED" };
    } catch (err) {
      return { output: err as string, status: "ERROR" };
    } finally {
      await nodejsDockerContainer.remove({
        force: true,
      });
    }
  }
}

export default NodeJSExecutor;
