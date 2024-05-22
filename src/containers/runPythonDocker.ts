import { PYTHON_IMAGE } from "../utils/constants";
import createContainer from "./containerFactory";
import decodeDockerStream from "./dockerHelper";
import pullImage from "./pullImage";

async function runPython(code: string, inputTestCase: string) {
  const rawLogBuffer: Buffer[] = [];

  console.log("Initialising A New Python Docker Container");

  const runCommand = `echo '${code.replace(
    /'/g,
    `'\\"`
  )}' > test.py && echo '${inputTestCase.replace(
    /'/g,
    `'\\"`
  )}' | python3 test.py`;

  console.log(runCommand);

  await pullImage(PYTHON_IMAGE);

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

  await new Promise((res) => {
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
}

export default runPython;
