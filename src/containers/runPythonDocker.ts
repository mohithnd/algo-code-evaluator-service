import { DockerStreamOutput } from "../types/dockerStreamOutput";
import { PYTHON_IMAGE } from "../utils/constants";
import createContainer from "./containerFactory";
import decodeDockerStream from "./dockerHelper";
import isImagePresent from "./isImagePresent";
import pullImage from "./pullImage";

async function runPython(
  code: string,
  inputTestCases: string[]
): Promise<DockerStreamOutput> {
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

  const response: DockerStreamOutput = await new Promise((res) => {
    loggerStream.on("end", () => {
      console.log(rawLogBuffer);

      const completeBuffer = Buffer.concat(rawLogBuffer);
      const decodedStream = decodeDockerStream(completeBuffer);

      console.log(decodedStream);
      console.log(decodedStream.stdout);

      res(decodedStream);
    });
  });

  await pythonDockerContainer.remove();

  return response;
}

export default runPython;
