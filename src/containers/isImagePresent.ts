import Docker from "dockerode";

export default async function isImagePresent(
  imageName: string
): Promise<boolean> {
  const docker = new Docker();
  console.log(`Checking if image is present: ${imageName}`);

  const allImages = await docker.listImages();

  for (const imageInfo of allImages) {
    const imageTags = imageInfo.RepoTags as string[];
    for (const image of imageTags) {
      if (image === imageName) {
        console.log(`Image found: ${imageName}`);
        return true;
      }
    }
  }

  console.log(`Image not found: ${imageName}`);
  return false;
}
