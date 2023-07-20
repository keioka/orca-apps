import type { NextApiRequest, NextApiResponse } from 'next';
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { flatten } from 'lodash';
import axios from 'axios'
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const { url } = req.body;

    const response = await axios.request({
      method: 'GET',
      url: 'https://lexper.p.rapidapi.com/v1.1/extract',
      params: {
        url,
        js_timeout: '30',
        media: 'true'
      },
      headers: {
        'X-RapidAPI-Key': 'REDACTED_RAPIDAPI_KEY',
        'X-RapidAPI-Host': 'lexper.p.rapidapi.com'
      }
    });


    const result = response.data

    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1200,
      chunkOverlap: 1,
    });

    const content = result.article.text

    const output = await splitter.createDocuments([content]);

    const vocabs = await Promise.all(output.map(async (document) => {
      const response = await openai.createChatCompletion({
        model: "gpt-4",
        messages: [{
          role: "user",
          content: `
          List vocabularies or phrasal verbs in the paragraph below, add their semantic meanings, and translate them into Japanese.

          Format should be the array of JSON.

          [{
            "vocab": "Vocabulary",
            "meaning": "Meaning",
            "ja": "Translation",
            "sentence": "Sentence from paragraph"
          }]

          ---------------------

          ${document.pageContent}          
        `}],
        temperature: 0,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 1,
      });
      console.log('response', response.data.choices[0].message);

      return JSON.parse(response.data.choices[0].message?.content || '[]')
    }))

    console.log('vocabs', vocabs);

    res.status(200).json({
      image: result.image,
      summary: [{
        level: 'GENERAL',
        content: result.summary
      }],
      vocabulary: flatten(vocabs),
    });
  } catch (error: any) {
    console.log('error', error);
    res.status(500).json({ error: error.message || 'Something went wrong' });
  }
}
