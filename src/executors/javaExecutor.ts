import serverConfig from "../config/server.config";
import createContainer from "../containers/containerFactory";
import { fetchDecodedStream } from "../containers/dockerHelper";
import isImagePresent from "../containers/isImagePresent";
import pullImage from "../containers/pullImage";
import CodeExecutorStrategy, {
  ExecutionResponse,
} from "../types/codeExecutorStrategy";

class JavaExecutor implements CodeExecutorStrategy {
  async execute(
    code: string,
    inputTestCases: string[],
    outputTestCases: string[]
  ): Promise<ExecutionResponse> {
    const rawLogBuffer: Buffer[] = [];
    console.log("Executing Java code...");

    inputTestCases.unshift(`${inputTestCases.length}`);
    console.log("Input test cases:", inputTestCases);
    console.log("Output test cases:", outputTestCases);

    const escapedCode = code.replace(/'/g, `'\\"'`);
    const escapedInput = inputTestCases.join(" ").replace(/'/g, `'\\"'`);
    const runCommand = `echo '${escapedCode}' > Main.java && javac Main.java && echo '${escapedInput}' | java Main`;

    console.log("Run command:", runCommand);

    if (!(await isImagePresent(serverConfig.JAVA_IMAGE))) {
      console.log("Java image not found, pulling image...");
      await pullImage(serverConfig.JAVA_IMAGE);
    }

    const javaDockerContainer = await createContainer(serverConfig.JAVA_IMAGE, [
      "/bin/sh",
      "-c",
      runCommand,
    ]);

    await javaDockerContainer.start();
    console.log("Started Java Docker Container");

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
      console.log("Execution response:", response);
      return { output: response, status: "COMPLETED" };
    } catch (err) {
      console.error("Execution error:", err);
      return { output: err as string, status: "ERROR" };
    } finally {
      await javaDockerContainer.remove({ force: true });
      console.log("Java Docker Container removed");
    }
  }
}

export default JavaExecutor;
