import OpenAI from 'openai';

export const config = {
  maxDuration: 300,
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // defaults to process.env["OPENAI_API_KEY"]
});

interface GetVocabByWordSentenceParams { text: string }

async function getVocabsFromText(params: GetVocabByWordSentenceParams) {
  console.time('openai');
  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo-16k',
    temperature: 0,
    messages: [
      {
        role: "system",
        content: `          
          As an English teacher, can you give me vocabulary for an English learner including word, phrasal verbs and phrases as many as possible from the content below. 

          - [word]: Word , phrasal verb, or phrase
          - [pronounce]: Pronounce of the word or phrase
          - [meaning]: Meaning of the word or phrase
          - [sentence]: Sentence from the content
          - [transJaByContext]: Translate meaning of the word or phrase from English to Japanese
          - [example]: Give some examples of the word or phrase
          """
          ${params.text}
          """
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
                sentence: {
                  type: "string",
                  description: "sentence from the given content"
                },
                example: {
                  type: "string",
                  description: "other example for the word or phrase"
                },
                transJaByContext: {
                  type: "string",
                  description: "translation of the meaning or phrase to Japanese"
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
  // const body = await req.json();
  // const { text } = body;
  const { text } = req.body;

  if (req.method !== 'POST') {
    console.error("Method not allowed");
    // return resJSON(400, { message: 'Method not allowed' });
    res.status(405).json({ message: 'Method not allowed' });
  }

  if (!text) {
    console.error("Missing required fields");
    // return resJSON(400, { message: 'Missing required fields' });
    res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const { vocabs } = await getVocabsFromText({
      text
    })

    return res.status(200).json({ vocabs });
    // return resJSON(200, { vocabs });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: error.message });
    // return resJSON(500, { message: error.message });
  }
}


// function resJSON(status: number, data: any) {
//   return new NextResponse(
//     JSON.stringify(data),
//     {
//       status,
//       headers: {
//         'Content-Type': 'application/json'
//       }
//     }
//   )
// }