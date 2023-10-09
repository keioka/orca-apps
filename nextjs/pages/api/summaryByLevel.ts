import axios from "axios";
import OpenAI from 'openai';
import { NextResponse } from 'next/server'

export const config = {
  runtime: 'edge', //This specifies the runtime environment that the middleware function will be executed in.
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // defaults to process.env["OPENAI_API_KEY"]
});

interface GetVocabByWordSentenceParams { url: string, levels: string[] }

async function getSummaryForLevel({ url, levels }: GetVocabByWordSentenceParams) {
  console.time('openai-' + levels.join('-'));


  const levelDescriptions = {
    "A1": "A1 (Beginner): Understand and use familiar everyday expressions and very basic phrases. (IELTS:Below 4.0, TOEFL iBT: 0-56, TOEIC: Below 120)",
    "A2": "A2 (Elementary): Understand sentences and frequently used expressions related to areas of immediate relevance. (IELTS:4.0, TOEFL iBT: 57-86, TOEIC: 120-225)",
    "B1": "B1 (Intermediate): Deal with most situations likely to arise while traveling in an area where the language is spoken. (IELTS:4.5-5.0, TOEFL iBT: 87-109, TOEIC: 226-545)",
    "B2": "B2 (Upper Intermediate): Interact with a degree of fluency and spontaneity, making regular interaction with native speakers possible without strain. (IELTS:5.5-6.5, TOEFL iBT: 110-120, TOEIC: 546-785)",
    "C1": "C1 (Advanced): Use the language flexibly and effectively for social, academic, and professional purposes. (IELTS:7.0-8.0, TOEFL iBT: 95 and above, TOEIC: 786-990)",
    "C2": "C2 (Proficient): Understand virtually everything heard or read; express oneself spontaneously, fluently, and precisely. (IELTS:8.5-9.0, TOEFL iBT: 115 and above, TOEIC: Not specifically defined, but very high scores suggest strong command.)",
    "K5": "K5: Education period from kindergarten to fifth grade.",
    "5Y": "5Y: 5 years old, knows only 250 basic words."
  };

  const descriptionsForLevels = levels.map(level => levelDescriptions[level]).join("\n");
  const response = await openai.chat.completions.create({
    model: 'gpt-4-0613',
    temperature: 0,
    messages: [
      {
        role: "system",
        content: `          
        [Text from: ${url}]

        Provide a summary of the text from the provided URL for the levels: ${levels.join(', ')}.
        Make sure each summary is at least 250 words long, different from the others, and uses different levels of vocabularies.
        -----
        ${descriptionsForLevels}
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

  console.timeEnd('openai-' + levels.join('-'));

  const generatedText = response.choices[0].message.function_call.arguments;
  const result = JSON.parse(generatedText);

  return {
    summaries: result.summaries.filter(summary => levels.includes(summary.level))
  }
}

async function getSummary(params: GetVocabByWordSentenceParams) {
  // Split the flat levels array into groups of two
  const groupedLevels = [];
  for (let i = 0; i < params.levels.length; i += 2) {
    groupedLevels.push(params.levels.slice(i, i + 2));
  }

  const summaryPromises = groupedLevels.map(levelGroup => getSummaryForLevel({ url: params.url, levels: levelGroup }));
  const allSummaries = await Promise.all(summaryPromises);

  return {
    summaries: allSummaries.flatMap(summaryObj => summaryObj.summaries)
  };
}


export default async function handler(req, res) {
  const { url, levels } = req.body;

  if (req.method !== 'POST') {
    return resJSON(405, { message: 'Method not allowed' });
  }

  if (!url) {
    return resJSON(400, { message: 'Missing required fields' });
  }

  try {
    const { summaries } = await getSummary({ url, levels });

    return resJSON(200, { summaries });
  } catch (error) {
    return resJSON(500, { message: error.message });
  }
}


// https://platform.openai.com/account/rate-limits


function resJSON(status: number, data: any) {
  return new NextResponse(
    JSON.stringify(data),
    {
      status,
      headers: {
        'Content-Type': 'application/json'
      }
    }
  )
}