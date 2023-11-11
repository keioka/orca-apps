import { defer } from "@defer/client";
import { createArticlesByPublisherId } from "@/common/createArticlesByPublisherId";

export default defer(createArticlesByPublisherId);