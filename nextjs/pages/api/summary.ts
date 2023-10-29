import axios from "axios";
import OpenAI from 'openai';
import { NextResponse } from 'next/server'
import { getMaterialById } from '@/models/material';
import * as SummaryModel from "@/models/summary";

export const config = {
  // runtime: 'edge', //This specifies the runtime environment that the middleware function will be executed in.
  maxDuration: 300,
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // defaults to process.env["OPENAI_API_KEY"]
});

interface GetSummaryParams { url: string, levels: string[], materialId: string }

async function getSummaryForLevel({ url, levels }: GetSummaryParams) {
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

async function createSummary(params: GetSummaryParams) {
  // Split the flat levels array into groups of two
  const groupedLevels = [];
  for (let i = 0; i < params.levels.length; i += 2) {
    groupedLevels.push(params.levels.slice(i, i + 2));
  }

  const summaries = await Promise.all(groupedLevels.map(async (levelGroup) => {
    const summaries = await getSummaryForLevel({ url: params.url, levels: levelGroup })
    for (const summary of summaries.summaries) {
      return await SummaryModel.createSummary({
        materialId: params.materialId,
        level: summary.level,
        content: summary.summary
      })
    }
  }))

  return summaries
}


export default async function handler(req, res) {
  // const body = await req.json();
  // const { url, levels } = body;

  const { levels, materialId } = req.body;

  if (req.method !== 'POST') {
    console.error("Method not allowed");
    return res.status(405).json({ message: 'Method not allowed' });
    // return resJSON(405, { message: 'Method not allowed' });
  }

  if (!materialId) {
    console.error("Missing required fields");
    // return resJSON(400, { message: 'Missing required fields' });
    return res.status(400).json({ message: 'Missing required fields' });
  }


  const material = await getMaterialById(materialId)

  let findAll = true
  let missingSummariesByLevel = []
  const summaries = []

  for (const level of levels) {
    const summary = await SummaryModel.fetchSummaryBy({
      materialId: materialId,
      level: level
    })
    if (!summary) {
      findAll = false
      missingSummariesByLevel.push(level)
    } else {
      summaries.push(summary)
    }
  }


  if (!material) {
    return res.status(404).json({ message: 'Material not found' });
  }
  const urlToUse = material.url

  if (!urlToUse) {
    return res.status(400).json({ message: 'Missing urlToUse' });
  }

  try {
    const summaries = await createSummary({ url: urlToUse, levels, materialId });
    return res.status(200).json({ summaries });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
    // return resJSON(500, { message: error.message });
  }
}


// https://platform.openai.com/account/rate-limits


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