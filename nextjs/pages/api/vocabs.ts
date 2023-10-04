import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // defaults to process.env["OPENAI_API_KEY"]
});

interface GetVocabByWordSentenceParams { url: string }

async function getVocabs(params: GetVocabByWordSentenceParams) {
  console.time('openai');
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo-16k',
    temperature: 0,
    messages: [
      {
        role: "system",
        content: `
          [Text from: ${params.url}]
          
          As an English teacher, can you give me vocabulary for an English learner including phrasal verbs and phrases as many as possible from a given url. 
          At least 25 words.
        `
      }
    ],
    functions: [{
      name: "set_recipe",
      parameters: {
        type: "object",
        properties: {
          vocabs: {
            type: "array",
            items: {
              type: 'object',
              properties: {
                word: {
                  type: "string",
                  description: "sentence from the content"
                },
                pronounce: {
                  type: "string",
                  description: "Pronounce of the word or phrase"
                },
                meaning: {
                  type: "string",
                  description: "Meaning of the word or phrase"
                },
                example: {
                  type: "string",
                  description: "sentence from the content"
                },
                transJa: {
                  type: "string",
                  description: "translation of the word or phrase to Japanese"
                },
              }
            }
          }
        }
      }
    }],
    function_call: { name: "set_recipe" }
  });
  console.timeEnd('openai'); //Prints something like that-> test: 11374.004ms

  const generatedText = response.choices[0].message.function_call.arguments;
  const result = JSON.parse(generatedText)

  if (!result || !result.vocabs) {
    return { err: 'No response from OpenAI' }
  }

  return {
    vocabs: result.vocabs
  }

}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { url } = req.body;

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  if (!url) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const { vocabs } = await getVocabs({
      url
    })

    return res.status(200).json({ vocabs });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
