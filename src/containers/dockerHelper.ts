import { DockerStreamOutput } from "../types/dockerStreamOutput";
import { DOCKER_STREAM_HEADER_SIZE } from "../utils/constants";

export default function decodeDockerStream(buffer: Buffer): DockerStreamOutput {
  let offset = 0;

  const output: DockerStreamOutput = {
    stdout: "",
    stderr: "",
  };

  while (offset < buffer.length) {
    const channel = buffer[offset];

    const length = buffer.readUint32BE(offset + 4);

    offset += DOCKER_STREAM_HEADER_SIZE;

    if (channel === 1) {
      // stdout stream
      output.stdout += buffer.toString("utf-8", offset, offset + length);
    } else if (channel === 2) {
      // stderr stream
      output.stderr += buffer.toString("utf-8", offset, offset + length);
    }

    offset += length;
  }

  return output;
}

export async function fetchDecodedStream(
  loggerStream: NodeJS.ReadableStream,
  rawLogBuffer: Buffer[]
): Promise<string> {
  return new Promise((res, rej) => {
    const timeout = setTimeout(() => {
      console.log("Timeout Called");
      rej("TIME LIMIT EXCEEDED");
    }, 2000);

    loggerStream.on("end", () => {
      clearTimeout(timeout);
      const completeBuffer = Buffer.concat(rawLogBuffer);
      const decodedStream = decodeDockerStream(completeBuffer);

      console.log(decodedStream);

      if (decodedStream.stderr) {
        rej(decodedStream.stderr);
      } else {
        res(decodedStream.stdout);
      }
    });
  });
}
