import { NextApiRequest, NextApiResponse } from 'next';
import { YoutubeTranscript } from 'youtube-transcript';
import { getMaterialById } from '@/models/material';
import { OpenAIApi, Configuration } from 'openai';
import winkNLP from 'wink-nlp';
// import model from 'wink-eng-lite-model'
import { extract, extractFromHtml } from '@extractus/article-extractor'
import * as cheerio from 'cheerio'
import { createVocabs } from '@/models/material';
import { split } from 'sentence-splitter'
import { Prisma } from '@prisma/client';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);
// const nlp = winkNLP(model);


async function getVocabs(content: string) {
  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo-16k",
    temperature: 0,
    messages: [
      {
        role: "system",
        content: `
          As an English teacher, please create a list of vocabularies, phrasal verbs, and phrases as many as possible from a given transcript. 
          The format should be in an array of the object like recipe:
        `
      },
      {
        role: "user",
        content: JSON.stringify(content)
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
                type: {
                  type: "string",
                  description: "vocab, phrasal verb, phrase"
                },
                sentence: {
                  type: "string",
                  description: "sentence from the content"
                },
                meaning: {
                  type: "string",
                  description: "Meaning of the word or phrase"
                },
                translation: {
                  type: "string",
                  description: "Meaning in Japanase"
                },
              }
            }
          }
        }
      }
    }],
    function_call: { name: "set_recipe" }
  });

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
  const { url } = req.query;

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  if (!url) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  getVocabs

}