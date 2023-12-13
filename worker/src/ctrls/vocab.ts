import { getVocabsFromText } from '../openai/vocab'

export async function vocab(req, res) {
  const { paragraph } = req.body;

  const { vocabs } = await getVocabsFromText({
    text: paragraph,
    transLangCode: "ja",
    id: "1"
  })

  return {
    status: 'ok',
    vocabs
  }
}