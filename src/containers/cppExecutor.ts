import CodeExecutorStrategy, {
  ExecutionResponse,
} from "../types/codeExecutorStrategy";
import { CPP_IMAGE } from "../utils/constants";
import createContainer from "./containerFactory";
import { fetchDecodedStream } from "./dockerHelper";
import isImagePresent from "./isImagePresent";
import pullImage from "./pullImage";

class CPPExecutor implements CodeExecutorStrategy {
  async execute(
    code: string,
    inputTestCases: string[],
    outputTestCases: string[]
  ): Promise<ExecutionResponse> {
    const rawLogBuffer: Buffer[] = [];

    console.log(outputTestCases);

    console.log("Initialising A New C++ Docker Container");

    const runCommand = `echo '${code.replace(
      /'/g,
      `'\\"`
    )}' > test.cpp && g++ test.cpp -o test && echo '${inputTestCases
      .join(" ")
      .replace(/'/g, `'\\"`)}' | stdbuf -oL -eL ./test`;

    console.log(runCommand);

    if (!(await isImagePresent(CPP_IMAGE))) {
      await pullImage(CPP_IMAGE);
    }

    const cppDockerContainer = await createContainer(CPP_IMAGE, [
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
      await cppDockerContainer.remove();
    }
  }
}

export default CPPExecutor;
