import { defer } from "@defer/client";
import { createArticlesByPublisherId } from "../common/createArticlesByPublisherId";

const createArticlesByPublisherIdsDefer = async ({ publisherIds }: { publisherIds: string[] }) => {
  const result = await Promise.all(publisherIds.map(async (publisherId) => {
    return await createArticlesByPublisherId({ publisherId })
  }))

  return result
}

export default defer(createArticlesByPublisherIdsDefer, { concurrency: 2, retry: 1 });