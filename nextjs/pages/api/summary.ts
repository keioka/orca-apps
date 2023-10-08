import axios from "axios";
const DEEPL_API_ENDPOINT = 'https://api-free.deepl.com/v2/translate';
const USER_AGENT = 'YourApp/1.2.3';  // Replace with your application's user agent

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // defaults to process.env["OPENAI_API_KEY"]
});

interface GetVocabByWordSentenceParams { url: string }

async function getSummary(params: GetVocabByWordSentenceParams) {
  console.time('openai');
  const response = await openai.chat.completions.create({
    model: 'gpt-4-0613',
    temperature: 0,
    messages: [
      {
        role: "system",
        content: `          
        [Text from: ${params.url}]

        Provide a summary of the text from the provided URL for each of the levels: K5, 5Y, A1, A2, B1, B2, C1, C2. These levels are based on the Common European Framework of Reference for Languages (CEFR), IELTS, TOEFL iBT, and TOEIC proficiency standards.
        Make sure each summary is at least 250 words long, different from the others, and uses different level of vocabularies.
        -----
        Common European Framework of Reference for Languages (CEFR), IELTS, TOEFL iBT, and TOEIC proficiency standards:
        A1 (Beginner): Understand and use familiar everyday expressions and very basic phrases. (IELTS:Below 4.0, TOEFL iBT: 0-56, TOEIC: Below 120)
        A2 (Elementary): Understand sentences and frequently used expressions related to areas of immediate relevance. (IELTS:4.0, TOEFL iBT: 57-86, TOEIC: 120-225)
        B1 (Intermediate): Deal with most situations likely to arise while traveling in an area where the language is spoken. (IELTS:4.5-5.0, TOEFL iBT: 87-109, TOEIC: 226-545)
        B2 (Upper Intermediate): Interact with a degree of fluency and spontaneity, making regular interaction with native speakers possible without strain. (IELTS:5.5-6.5, TOEFL iBT: 110-120, TOEIC: 546-785)
        C1 (Advanced): Use the language flexibly and effectively for social, academic, and professional purposes. (IELTS:7.0-8.0, TOEFL iBT: 7.0-8.0, TOEIC: 786-990)
        C2 (Proficient): Understand virtually everything heard or read; express oneself spontaneously, fluently, and precisely. (IELTS:8.5-9.0, TOEFL iBT: 8.5-9.0, TOEIC: Not specifically defined, but very high scores (close to the maximum) suggest strong command of the language.
        ---
        This is additional information for the levels:
        K5: the education period from kindergarten to fifth grade. 
        5Y: 5 years old who only knows 250 basic words.
        `
      }
    ],
    functions: [{
      name: "set_recipe",
      parameters: {
        type: "object",
        properties: {
          summaries: {
            type: "array",
            items: {
              type: 'object',
              properties: {
                level: {
                  type: "string",
                  description: "sentence from the content"
                },
                summary: {
                  type: "string",
                  description: "Pronounce of the word or phrase"
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

  if (!result || !result.summaries) {
    return { err: 'No response from OpenAI' }
  }

  return {
    summaries: result.summaries
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
    const { summaries } = await getSummary({
      url
    })

    return res.status(200).json({ summaries });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}


async function translateText(text: string, targetLang: string): Promise<string> {
  try {
    const response = await axios.post(
      DEEPL_API_ENDPOINT,
      {
        text: [text],
        target_lang: targetLang
      },
      {
        headers: {
          'Authorization': `DeepL-Auth-Key ${process.env.DEEPL_AUTH_KEY}`,
          'User-Agent': USER_AGENT,
          'Content-Type': 'application/json'
        }
      }
    );

    const translations = response.data.translations;
    if (translations && translations.length > 0) {
      return translations[0].text;
    } else {
      throw new Error('No translations received from DeepL');
    }

  } catch (error) {
    console.error(error);
    throw new Error(`Error translating text: ${error.message}`);
  }
}

