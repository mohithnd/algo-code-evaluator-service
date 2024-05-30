import Docker from "dockerode";

export default async function isImagePresent(
  imageName: string
): Promise<boolean> {
  const docker = new Docker();

  const allImages = await docker.listImages();

  console.log(allImages);

  for (const imageInfo of allImages) {
    const imageTags = imageInfo.RepoTags as string[];
    for (const image of imageTags) {
      if (image == imageName) {
        return true;
      }
    }
  }

  return false;
}
