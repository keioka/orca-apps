import { defer } from "@defer/client";
import { createVocabsFromUrl } from "@/common/createVocabsFromUrl";

async function createVocabsFromUrlDefer(params: { materialId: string, url: string, transLangCode: string }) {
  console.log("createVocabsFromUrlDefer");
  return createVocabsFromUrl(params)
}

export default defer(createVocabsFromUrlDefer, { concurrency: 10, retry: 3 });