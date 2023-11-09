import { defer } from "@defer/client";
import { checkPublishersCrawledStatus } from "@/models/publisher";
import { createArticlesByPublisherId } from "@/common/createArticlesByPublisherId";

async function fetchMaterialsEveryFiveMinutes() {
  // business logic here
  const publishers = await checkPublishersCrawledStatus()
  const publishersToCrawl = publishers.slice(0, 10)

  await Promise.all(publishersToCrawl.map(async (publisher) => {
    const { materials } = await createArticlesByPublisherId({ publisherId: publisher.id })
    return materials
  }))

  console.log("Fetching materials every 5 minutes");
}

export default defer.cron(fetchMaterialsEveryFiveMinutes, "*/5 * * * *");