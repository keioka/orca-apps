import { OpenAIApi, Configuration } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

interface GetVocabByWordSentenceParams { word: string, sentence: string }

async function getVocabByWordSentence(params: GetVocabByWordSentenceParams) {
  console.time('openai');
  console.log({ params })
  const response = await openai.createChatCompletion({
    model: "gpt-4",
    temperature: 0,
    messages: [
      {
        role: "system",
        content: `
          As an English teacher, Please generate possible meaning of 'word' from the context of sentence. Include phrasal verbs, idiomatic expressions, and other noteworthy phrases. Organize the list in a format similar to a recipe, using an array of objects."

          """
          word: ${params.word}
          sentence: ${params.sentence}
          """
        `
      }
    ],
    functions: [{
      name: "set_recipe",
      parameters: {
        type: "object",
        properties: {
          words: {
            type: "array",
            items: {
              type: 'object',
              properties: {
                word: {
                  type: "string",
                  description: "word"
                },
                sentence: {
                  type: "string",
                  description: "sentence from the content"
                },
                meaning: {
                  type: "string",
                  description: "Meaning of the word or phrase"
                }
              }
            }
          }
        }
      }
    }],
    function_call: { name: "set_recipe" }
  });
  console.timeEnd('openai'); //Prints something like that-> test: 11374.004ms

  const generatedText = response.data.choices[0].message.function_call.arguments;
  const result = JSON.parse(generatedText)
  console.log({ result })

  if (!result || !result.words) {
    return { err: 'No response from OpenAI' }
  }

  return {
    words: result.words
  }

}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { materialId } = req.query;
  const { word, sentence } = req.body;

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  if (!materialId) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  if (!word || !sentence) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const vocab = await getVocabByWordSentence({
      word: word as string,
      sentence: sentence as string
    })

    return res.status(200).json({ vocab });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
