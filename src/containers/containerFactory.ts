import Docker from "dockerode";

async function createContainer(
  imageName: string,
  cmdExecutable: string[]
): Promise<Docker.Container> {
  const docker = new Docker();

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

  return container;
}

export default createContainer;
