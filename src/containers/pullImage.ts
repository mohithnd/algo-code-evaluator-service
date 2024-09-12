import Docker from "dockerode";

export default function pullImage(imageName: string) {
  console.log(`Pulling image: ${imageName}`);
  try {
    const docker = new Docker();
    return new Promise((res, rej) => {
      docker.pull(imageName, (err: Error, stream: NodeJS.ReadableStream) => {
        if (err) {
          console.error(`Error pulling image: ${err.message}`);
          throw err;
        }
        docker.modem.followProgress(
          stream,
          (err, response) => {
            if (err) {
              console.error(`Error during image pull progress: ${err.message}`);
              rej(err);
            }
            console.log(`Image pull response: ${JSON.stringify(response)}`);
            res(response);
          },
          (event) => {
            console.log(`Pulling image status: ${event.status}`);
          }
        );
      });
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error(`Error in pullImage function: ${err.message}`);
    } else {
      console.error(`Unknown error: ${String(err)}`);
    }
  }
}
