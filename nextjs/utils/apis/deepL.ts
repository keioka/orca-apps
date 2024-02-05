import * as deepl from 'deepl-node';

export function translate({ texts, targetLang }: { texts: string[], targetLang: string }) {
  const translator = new deepl.Translator(process.env.DEEPL_AUTH_KEY);
  return translator.translateText(
    texts,
    null,
    targetLang,
  );
}