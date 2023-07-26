import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: "YOUR_OPENAI_API_KEY",
});
const openai = new OpenAIApi(configuration);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // Transcribe an audio file
    const file = req.file;
    const result = await openai.createTranscription(
      file,
      "whisper-1"
    );

    res.status(200).json(result);
  } else {
    // Handle any other HTTP method
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}