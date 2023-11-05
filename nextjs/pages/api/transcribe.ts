import OpenAI from 'openai';
import { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm } from 'formidable';

export const config = {
  api: {
    bodyParser: false,
  },
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // defaults to process.env["OPENAI_API_KEY"]
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    // Transcribe an audio file
    const form = new IncomingForm();

    try {
      const [fields, files] = await form.parse(req)
      console.log({
        fields,
        files
      })
    } catch (err) {
      console.error(err)
    }

    return res.status(200).json({ message: "ok" })
    // const result = await openai.audio.transcriptions.create({
    //   file,
    //   model: "whisper-1",
    // });

    // res.status(200).json(result);
  }
}