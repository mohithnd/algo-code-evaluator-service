import sampleQueue from "../queues/sample.queue";

export default async function (
  name: string,
  payload: Record<string, unknown>,
  priority: number
) {
  await sampleQueue.add(name, payload, { priority: priority });
}
