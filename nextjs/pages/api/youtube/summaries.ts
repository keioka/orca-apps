import { NextApiRequest, NextApiResponse } from 'next';
import { YoutubeTranscript } from 'youtube-transcript';
import { getMaterialById } from '@/models/material';
import { OpenAIApi, Configuration } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const schema = {
  "content": "string",
  "level": "string",
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { materialId, level = "A1" } = req.body;

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  if (!materialId) {
    return res.status(400).json({ message: 'Missing materialId' });
  }

  const material = await getMaterialById(materialId)
  if (!material) {
    return res.status(404).json({ message: 'Material not found' });
  }

  const videoId = material.externalId;
  if (!videoId) {
    return res.status(400).json({ message: 'Material Missing ExternalId' });
  }

  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);

    const fullContent = transcript.map(t => t.text).join(' ');

    const prompt = `
      Transcription: ${fullContent}
      Level of Summary: ${level}
    `

    const response = await openai.createChatCompletion({
      model: "gpt-4",
      temperature: 0,
      messages: [
        {
          role: "system",
          content: `
            As an English teacher, please create a summary of the transcription for a given level: A1 (5 years old), A2 (10 years old), B1 (14 years old), B2(18 years old), C1 (Adult), and C2 (Native). 
            A summary should be around 250 words. 

            The response format should be pure JSON as one string and the JSON object like below

            The JSON response:
            { "content": "summary of content for A1 level", "level": "A1"},
          `
        },
        { role: "user", content: prompt }
      ],
      // functions: [{ "name": "set_recipe", "parameters": schema }],
    });


    const result = response.data.choices[0].message

    if (!result || !result.content) {
      return res.status(500).json({ error: 'No response from OpenAI' });
    }

    console.log({ response })

    const summaries = JSON.parse(result.content)

    return res.status(200).json({
      materialId,
      ...summaries
    });
  } catch (err) {
    console.error(err)
    return res.status(500).json(err);
  }
};