import { getVocabsFromText } from '../openai/vocab'

export async function vocab(req, res) {
  const { text } = req.body
  const { vocabs } = await getVocabsFromText({
    text,
    transLangCode: "ja",
    id: "1"
  })

  return {
    status: 'ok',
    vocabs
  }
}