import { defer } from "@defer/client";
import { checkPublishersCrawledStatus } from "@/models/publisher";
import createArticlesByPublisherId from "@/defer/createArticlesByPublisherId";

async function fetchMaterialsEveryFiveMinutes() {
  // business logic here
  console.log("Fetching materials every 5 minutes starts");
  const publishers = await checkPublishersCrawledStatus()
  const publishersToCrawl = publishers.slice(0, 50)
  console.log({
    createArticlesByPublisherId
  })
  await Promise.all(publishersToCrawl.map(async (publisher) => {
    await createArticlesByPublisherId({ publisherId: publisher.id })
  }))

  console.log("Fetching materials every 5 minute ends");
}

export default defer.cron(fetchMaterialsEveryFiveMinutes, "*/5 * * * *");