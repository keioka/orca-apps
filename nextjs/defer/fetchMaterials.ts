import { defer } from "@defer/client";
import { checkPublishersCrawledStatus } from "@/models/publisher";
import createArticlesByPublisherId from "@/defer/createArticlesByPublisherId";

async function fetchMaterialsEveryFiveMinutes() {
  // business logic here
  console.log("Fetching materials every 5 minutes starts");
  const publishers = await checkPublishersCrawledStatus()
  const publishersToCrawl = publishers.slice(0, 50)
  await Promise.all(publishersToCrawl.map(async (publisher) => {
    try {
      await createArticlesByPublisherId({ publisherId: publisher.id })
    } catch (error) {
      console.error(`Error createArticlesByPublisherId: ${publisher.id}`, error)
    }
  }))

  console.log("Fetching materials every 5 minute ends");
}

export default defer.cron(fetchMaterialsEveryFiveMinutes, "*/5 * * * *");