import Docker from "dockerode";

async function createContainer(
  imageName: string,
  cmdExecutable: string[]
): Promise<Docker.Container> {
  const docker = new Docker();
  console.log(`Creating container with image: ${imageName}`);

  const container = await docker.createContainer({
    Image: imageName,
    Cmd: cmdExecutable,
    AttachStdin: true,
    AttachStdout: true,
    AttachStderr: true,
    Tty: false,
    OpenStdin: true,
    HostConfig: {
      Memory: 512 * 1024 * 1024,
    },
  });

  console.log(`Container created: ${container.id}`);
  return container;
}

export default createContainer;
