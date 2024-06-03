import { DockerStreamOutput } from "../types/dockerStreamOutput";
import { JAVA_IMAGE } from "../utils/constants";
import createContainer from "./containerFactory";
import decodeDockerStream from "./dockerHelper";
import isImagePresent from "./isImagePresent";
import pullImage from "./pullImage";

async function runJava(
  code: string,
  inputTestCase: string
): Promise<DockerStreamOutput> {
  const rawLogBuffer: Buffer[] = [];

  console.log("Initialising A New Java Docker Container");

  const runCommand = `echo '${code.replace(
    /'/g,
    `'\\"`
  )}' > test.java && echo '${inputTestCase.replace(
    /'/g,
    `'\\"`
  )}' | java test.java`;

  console.log(runCommand);

  if (!(await isImagePresent(JAVA_IMAGE))) {
    await pullImage(JAVA_IMAGE);
  }

  const javaDockerContainer = await createContainer(JAVA_IMAGE, [
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

  await javaDockerContainer.remove();

  return response;
}

export default runJava;
