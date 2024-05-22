import { CPP_IMAGE } from "../utils/constants";
import createContainer from "./containerFactory";
import decodeDockerStream from "./dockerHelper";
import isImagePresent from "./isImagePresent";
import pullImage from "./pullImage";

async function runCpp(code: string, inputTestCase: string) {
  const rawLogBuffer: Buffer[] = [];

  console.log("Initialising A New C++ Docker Container");

  const runCommand = `echo '${code.replace(
    /'/g,
    `'\\"`
  )}' > test.cpp && g++ test.cpp -o test && echo '${inputTestCase.replace(
    /'/g,
    `'\\"`
  )}' | stdbuf -oL -eL ./test`;

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

  const response = await new Promise((res) => {
    loggerStream.on("end", () => {
      console.log(rawLogBuffer);

      const completeBuffer = Buffer.concat(rawLogBuffer);
      const decodedStream = decodeDockerStream(completeBuffer);

      console.log(decodedStream);
      console.log(decodedStream.stdout);

      res(decodedStream);
    });
  });

  await cppDockerContainer.remove();

  return response;
}

export default runCpp;
