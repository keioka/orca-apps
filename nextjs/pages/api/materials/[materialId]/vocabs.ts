import { NextApiRequest, NextApiResponse } from 'next';
import { YoutubeTranscript } from 'youtube-transcript';
import { getMaterialById } from '@/models/material';
import { OpenAIApi, Configuration } from 'openai';
import winkNLP from 'wink-nlp';
import model from 'wink-eng-lite-model'
import { extract, extractFromHtml } from '@extractus/article-extractor'
import * as cheerio from 'cheerio'
import { createVocabs } from '@/models/material';
import { split } from 'sentence-splitter'
import { Prisma } from '@prisma/client';
import { parse } from 'node-html-parser';
import compromise from 'compromise'

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);
// const nlp = winkNLP(model);
const nlp = winkNLP(model);

interface GetVocabByWordSentenceParams { word: string, sentence: string }

async function getVocabByWordSentence(params: GetVocabByWordSentenceParams) {
  console.time('openai');
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    temperature: 0,
    prompt: `
      As an English teacher, please create a list of vocabulary including phrasal verbs and phrases as many as possible from a given content. 
      The format should be in an array of the object like recipe:
      [{
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
      }]

      """
      ${content}
      """
    `,
  });
  console.timeEnd('openai'); //Prints something like that-> test: 11374.004ms
  console.log({ choices: response.data.choices })

  const generatedText = response.data.choices[0].message.function_call.arguments;
  const result = JSON.parse(generatedText)

  if (!result || !result.words) {
    return { err: 'No response from OpenAI' }
  }

  return {
    words: result.words
  }
}

async function getVocabs(content: string) {
  console.time('openai');
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    temperature: 0,
    prompt: `
      As an English teacher, please create a list of vocabulary including phrasal verbs and phrases as many as possible from a given content. 
      The format should be in an array of the object like recipe:
      [{
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
      }]

      """
      ${content}
      """
    `,
  });
  console.timeEnd('openai'); //Prints something like that-> test: 11374.004ms
  console.log({ choices: response.data.choices })

  const generatedText = response.data.choices[0].message.function_call.arguments;
  const result = JSON.parse(generatedText)

  if (!result || !result.words) {
    return { err: 'No response from OpenAI' }
  }

  return {
    words: result.words
  }
}

async function getVocabsByChatCompletion(url: string) {
  console.time('openai');
  const response = await openai.createChatCompletion({
    model: "gpt-4",
    temperature: 0,
    messages: [
      {
        role: "system",
        content: `
          [Text from: ${url}]

          As an English teacher, Please generate a list of 100 vocabulary from the provided URL as many as possible. Include phrasal verbs, idiomatic expressions, and other noteworthy phrases. Organize the list in a format similar to a recipe, using an array of objects."
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

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  if (!materialId) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  const material = await getMaterialById(materialId as string)

  console.log({ url: material.url })

  if (!material) {
    return res.status(404).json({ message: 'Material not found' });
  }

  if (material.type === 'Article') {
    const result = await parseDocByUrl(material.url)

    console.log({ result })

    if (result.error) {
      return res.status(500).json({ error: result.error });
    }
    return res.status(200).json({
      ...result
    })
  } else {

  }

  // getVocabs(material.url)


  return res.status(500).json({ message: 'Error' });

}

interface Docs { sentence: string, words: string[], index: number }

async function parseDocByUrl(url: string): Promise<{ error?: string, docs?: Docs }> {
  const article = await extract(url)
  if (!article || !article.content) {
    return { error: 'No response from extract()', docs: null }
  }

  const root = parse(article.content);
  const doc = nlp.readDoc(root.structuredText);
  let vocabs = []

  try {
    vocabs = await getVocabsByChatCompletion(url)
  } catch (error) {
    console.error(error)
  }
  // const sentences = doc.sentences().out('array');

  // const docs: Docs = []
  // let index = 0

  // console.log({ sentences })
  // for (const sentence of sentences) {
  //   const tokens = nlp.readDoc(sentence).tokens().out('array');
  //   // const vocabs = compromise(sentence).terms().out('array')
  //   // console.log({ tokens })

  //   docs.push({
  //     sentence: sentence,
  //     words: tokens,
  //     index: index,
  //     vocabs
  //   })

  //   index++
  // }

  return { vocabs }
}