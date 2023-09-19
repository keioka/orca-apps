import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // defaults to process.env["OPENAI_API_KEY"]
});

interface GetVocabByWordSentenceParams { sentence: string }

async function getParaphrase(params: GetVocabByWordSentenceParams) {
  console.time('openai');
  console.log({ params })
  const response = await openai.chat.completions.create({
    model: "gpt-4",
    temperature: 0,
    messages: [
      {
        role: "system",
        content: `
          As an English teacher, Can you give me 5 paraphrases of this sentence

          """
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
          phrases: {
            type: "array",
            items: {
              type: 'object',
              properties: {
                sentence: {
                  type: "string",
                  description: "sentence from the content"
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

  console.log({ response: response })
  const generatedText = response.choices[0].message.function_call.arguments;
  const result = JSON.parse(generatedText)
  console.log({ result })

  if (!result || !result.phrases) {
    return { err: 'No response from OpenAI' }
  }

  return {
    phrases: result.phrases
  }

}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { sentence } = req.body;

  console.log({ body: req.body })
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  if (!sentence) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const { phrases } = await getParaphrase({
      sentence: sentence as string
    })

    return res.status(200).json({ phrases });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
