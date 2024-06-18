import { DockerStreamOutput } from "../types/dockerStreamOutput";
import { NODEJS_IMAGE } from "../utils/constants";
import createContainer from "./containerFactory";
import decodeDockerStream from "./dockerHelper";
import isImagePresent from "./isImagePresent";
import pullImage from "./pullImage";

async function runNodeJS(
  code: string,
  inputTestCases: string[]
): Promise<DockerStreamOutput> {
  const rawLogBuffer: Buffer[] = [];

  console.log("Initialising A New Node.js Docker Container");

  const runCommand = `echo '${code.replace(
    /'/g,
    `'\\"`
  )}' > test.js && echo '${inputTestCases
    .join("")
    .replace(/'/g, `'\\"`)}' | node test.js`;

  console.log(runCommand);

  if (!(await isImagePresent(NODEJS_IMAGE))) {
    await pullImage(NODEJS_IMAGE);
  }

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

  await nodejsDockerContainer.remove();

  return response;
}

export default runNodeJS;
