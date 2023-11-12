import { defer } from "@defer/client";
import { checkPublishersCrawledStatus } from "@/models/publisher";
import createArticlesByPublisherId from "@/defer/createArticlesByPublisherId";

async function fetchMaterialsEveryFiveMinutes() {
  // business logic here
  const publishers = await checkPublishersCrawledStatus()
  const publishersToCrawl = publishers.slice(0, 50)

  await Promise.all(publishersToCrawl.map(async (publisher) => {
    await createArticlesByPublisherId({ publisherId: publisher.id })
  })

  console.log("Fetching materials every 5 minutes");
}

export default defer.cron(fetchMaterialsEveryFiveMinutes, "*/5 * * * *");