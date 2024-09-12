import serverConfig from "../config/server.config";
import createContainer from "../containers/containerFactory";
import { fetchDecodedStream } from "../containers/dockerHelper";
import isImagePresent from "../containers/isImagePresent";
import pullImage from "../containers/pullImage";
import CodeExecutorStrategy, {
  ExecutionResponse,
} from "../types/codeExecutorStrategy";

class CPPExecutor implements CodeExecutorStrategy {
  async execute(
    code: string,
    inputTestCases: string[],
    outputTestCases: string[]
  ): Promise<ExecutionResponse> {
    const rawLogBuffer: Buffer[] = [];
    console.log("Executing C++ code...");

    inputTestCases.unshift(`${inputTestCases.length}`);
    console.log("Input test cases:", inputTestCases);
    console.log("Output test cases:", outputTestCases);

    const escapedCode = code.replace(/'/g, `'\\"'`);
    const escapedInput = inputTestCases.join(" ").replace(/'/g, `'\\"'`);
    const runCommand = `echo '${escapedCode}' > main.cpp && g++ main.cpp -o main && echo '${escapedInput}' | ./main`;

    console.log("Run command:", runCommand);

    if (!(await isImagePresent(serverConfig.CPP_IMAGE))) {
      console.log("C++ image not found, pulling image...");
      await pullImage(serverConfig.CPP_IMAGE);
    }

    const cppDockerContainer = await createContainer(serverConfig.CPP_IMAGE, [
      "/bin/sh",
      "-c",
      runCommand,
    ]);

    await cppDockerContainer.start();
    console.log("Started C++ Docker Container");

    const loggerStream = await cppDockerContainer.logs({
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
      await cppDockerContainer.remove({ force: true });
      console.log("C++ Docker Container removed");
    }
  }
}

export default CPPExecutor;
