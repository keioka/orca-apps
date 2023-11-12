import { defer } from "@defer/client";
import { createArticlesByPublisherId } from "@/common/createArticlesByPublisherId";

const test = async ({ publisherId }: { publisherId: string }) => {
  const result = await createArticlesByPublisherId({ publisherId })
  console.log({ result })
}

export default defer(test);