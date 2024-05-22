import { NODEJS_IMAGE } from "../utils/constants";
import createContainer from "./containerFactory";
import decodeDockerStream from "./dockerHelper";
import pullImage from "./pullImage";

async function runNodeJS(code: string, inputTestCase: string) {
  const rawLogBuffer: Buffer[] = [];

  console.log("Initialising A New Node.js Docker Container");

  const runCommand = `echo '${code.replace(
    /'/g,
    `'\\"`
  )}' > test.js && echo '${inputTestCase.replace(
    /'/g,
    `'\\"`
  )}' | node test.js`;

  console.log(runCommand);

  await pullImage(NODEJS_IMAGE);

  const nodejsDockerContainer = await createContainer(NODEJS_IMAGE, [
    "/bin/sh",
    "-c",
    runCommand,
  ]);

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

  await nodejsDockerContainer.remove();
}

export default runNodeJS;
