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

    console.log(outputTestCases);

    inputTestCases.unshift(`${inputTestCases.length}`);

    console.log("Initialising A New C++ Docker Container");

    const escapedCode = code.replace(/'/g, `'\\"'`);
    const escapedInput = inputTestCases.join(" ").replace(/'/g, `'\\"'`);
    const runCommand = `echo '${escapedCode}' > main.cpp && g++ main.cpp -o main && echo '${escapedInput}' | ./main`;

    console.log(runCommand);

    if (!(await isImagePresent(serverConfig.CPP_IMAGE))) {
      await pullImage(serverConfig.CPP_IMAGE);
    }

    const cppDockerContainer = await createContainer(serverConfig.CPP_IMAGE, [
      "/bin/sh",
      "-c",
      runCommand,
    ]);

    await cppDockerContainer.start();

    console.log("Started The C++ Docker Container");

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

      return { output: response, status: "COMPLETED" };
    } catch (err) {
      return { output: err as string, status: "ERROR" };
    } finally {
      await cppDockerContainer.remove({
        force: true,
      });
    }
  }
}

export default CPPExecutor;
