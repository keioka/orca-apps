import { defer } from "@defer/client";
import { createVocabsFromUrl } from "@/common/createVocabsFromUrl";

async function createVocabsFromUrlDefer(params: { materialId: string, url: string, transLangCode: string }) {
  console.log("createVocabsFromUrlDefer");
  createVocabsFromUrl(params)
}

export default defer(createVocabsFromUrlDefer);