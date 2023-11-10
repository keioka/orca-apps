import { defer } from "@defer/client";
import { checkPublishersCrawledStatus } from "@/models/publisher";
import { createArticlesByPublisherId } from "@/common/createArticlesByPublisherId";

async function fetchMaterialsEveryFiveMinutes() {
  // business logic here
  const publishers = await checkPublishersCrawledStatus()
  const publishersToCrawl = publishers.slice(0, 10)

  await Promise.all(publishersToCrawl.map((publisher) => {
    return createArticlesByPublisherId({ publisherId: publisher.id })
  }))

  console.log("Fetching materials every 5 minutes");
}

export default defer.cron(fetchMaterialsEveryFiveMinutes, "*/5 * * * *");