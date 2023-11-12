import { defer } from "@defer/client";
import { checkPublishersCrawledStatus } from "@/models/publisher";
import createArticlesByPublisherIds from "@/defer/createArticlesByPublisherIds";

async function fetchMaterialsEveryFiveMinutes() {
  // business logic here
  console.log("Fetching materials every 5 minutes starts");
  const publishers = await checkPublishersCrawledStatus()
  const publishersToCrawl = publishers.slice(0, 50)
  const publishersChunks = chunkArray(publishersToCrawl, 10)
  await Promise.all(publishersChunks.map(async (chunk) => {
    try {
      await createArticlesByPublisherIds({ publisherIds: chunk.map(publisher => publisher.id) })
    } catch (error) {
      console.error(`Error createArticlesByPublisherIds: ${chunk.map(publisher => publisher.id).join(", ")}`, error)
    }
  }))

  console.log("Fetching materials every 5 minute ends");
}

function chunkArray(array: any[], chunkSize: number) {
  const chunks = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

export default defer.cron(fetchMaterialsEveryFiveMinutes, "*/5 * * * *");