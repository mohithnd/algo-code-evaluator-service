import serverConfig from "../config/server.config";
import CodeExecutorStrategy, {
  ExecutionResponse,
} from "../types/codeExecutorStrategy";
import createContainer from "./containerFactory";
import { fetchDecodedStream } from "./dockerHelper";
import isImagePresent from "./isImagePresent";
import pullImage from "./pullImage";

class JavaExecutor implements CodeExecutorStrategy {
  async execute(
    code: string,
    inputTestCases: string[],
    outputTestCases: string[]
  ): Promise<ExecutionResponse> {
    const rawLogBuffer: Buffer[] = [];

    console.log(outputTestCases);

    console.log("Initialising A New Java Docker Container");

    const runCommand = `echo '${code.replace(
      /'/g,
      `'\\"`
    )}' > Main.java && echo '${inputTestCases
      .join("")
      .replace(/'/g, `'\\"`)}' | java Main.java`;

    console.log(runCommand);

    if (!(await isImagePresent(serverConfig.JAVA_IMAGE))) {
      await pullImage(serverConfig.JAVA_IMAGE);
    }

    const javaDockerContainer = await createContainer(serverConfig.JAVA_IMAGE, [
      "/bin/sh",
      "-c",
      runCommand,
    ]);

    await javaDockerContainer.start();

    console.log("Started The Java Docker Container");

    const loggerStream = await javaDockerContainer.logs({
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
      await javaDockerContainer.remove({
        force:true 
      });
    }
  }
}

export default JavaExecutor;
