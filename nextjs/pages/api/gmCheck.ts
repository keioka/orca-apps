import OpenAI from 'openai';
import axios from 'axios';

interface GetGMCheckParams { sentence: string; provider?: string }


async function grammarCheck({ text, provider = 'nlpcloud', language = 'en' }) {
  const res = await axios.request({
    method: 'POST',
    url: 'https://api.edenai.run/v2/text/spell_check',
    headers: {
      authorization: `Bearer ${process.env.EDENAI_API_KEY}`
    },
    data: {
      providers: provider,
      text,
      language
    }
  })

  return res.data
}


const blacklist = [
  "Possible Wrong Punctuation"
]




async function getGMCheck({ sentence, provider = 'nlpcloud' }: GetGMCheckParams) {
  const res = await grammarCheck({ text: sentence, provider })
  if (!res[provider]) {
    console.error(res)
    return { gmCheck: [] }
  }
  const result = res[provider]

  return {
    gmCheck: result.items.filter(item => !blacklist.includes(item.type)),
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { sentence, provider } = req.body;

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  if (!sentence) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const { gmCheck } = await getGMCheck({
      sentence: sentence as string,
      provider: provider as string | undefined
    })

    return res.status(200).json({ gmCheck });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}


// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY, // defaults to process.env["OPENAI_API_KEY"]
// });

// async function grammarCheck(params: GetVocabByWordSentenceParams) {
//   console.time('openai');
//   const response = await openai.chat.completions.create({
//     model: "gpt-4",
//     temperature: 0,
//     messages: [
//       {
//         role: "system",
//         content: `
//           As an English teacher, Can you fix this grammar and explain why it is wrong in detail?

//           """
//           sentence: ${params.sentence}
//           """
//         `
//       }
//     ],
//     functions: [{
//       name: "set_recipe",
//       parameters: {
//         type: "object",
//         properties: {
//           gmCheck: {
//             type: 'object',
//             properties: {
//               items: {
//                 type: "array",
//                 items: {
//                   type: 'object',
//                   properties: {
//                     offset: {
//                       type: "number",
//                       description: "offset"
//                     },
//                     length: {
//                       type: "number",
//                       description: "length"
//                     },
//                     text: {
//                       type: "string",
//                       description: "sentence from the content"
//                     },
//                     suggestions: {
//                       type: "array",
//                       items: {
//                         type: "object",
//                         properties: {
//                           fix: {
//                             type: "string",
//                             description: "Fix suggestion"
//                           },
//                           explainMistake: {
//                             type: "string",
//                             description: "Explain the grammar mistake"
//                           },
//                           score: {
//                             type: "number",
//                             description: "score"
//                           },
//                         }
//                       }
//                     },
//                   },
//                 }
//               }
//             }
//           }
//         }
//       }
//     }],
//     function_call: { name: "set_recipe" }
//   });
//   console.timeEnd('openai'); //Prints something like that-> test: 11374.004ms

//   console.log({ response })
//   const generatedText = response.choices[0].message.function_call.arguments;
//   const result = JSON.parse(generatedText)

//   if (!result || !result.gmCheck) {
//     return { err: 'No response from OpenAI' }
//   }

//   return {
//     gmCheck: result.gmCheck
//   }

// }

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse
// ) {
//   const { sentence } = req.body;

//   if (req.method !== 'POST') {
//     return res.status(405).json({ message: 'Method not allowed' });
//   }

//   if (!sentence) {
//     return res.status(400).json({ message: 'Missing required fields' });
//   }

//   try {
//     const { gmCheck } = await grammarCheck({
//       sentence: sentence as string
//     })

//     return res.status(200).json({ gmCheck });
//   } catch (error) {
//     return res.status(500).json({ message: error.message });
//   }
// }
