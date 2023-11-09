import { defer } from "@defer/client";
import { createVocabsFromUrl } from "@/common/createVocabsFromUrl";

// the function must be wrapped with `defer()` and exported as default
export default defer(createVocabsFromUrl);