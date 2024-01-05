import * as deepl from 'deepl-node';
const translator = new deepl.Translator(process.env.DEEPL_AUTH_KEY);

export function translate({ texts, targetLang }: { texts: string[], targetLang: string }) {
  return translator.translateText(
    texts,
    null,
    targetLang,
  );
}