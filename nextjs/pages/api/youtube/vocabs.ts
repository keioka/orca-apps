import { NextApiRequest, NextApiResponse } from 'next';
import { YoutubeTranscript } from 'youtube-transcript';
import { getMaterialById } from '@/models/material';
import { OpenAIApi, Configuration } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { materialId } = req.body;

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

    const response = await openai.createChatCompletion({
      model: "gpt-4",
      temperature: 0,
      messages: [
        {
          role: "system",
          content: `
            As an English teacher, please create a list of 50 vocabularies, phrasal verbs, and phrases as many as possible from a given transcript. 
            The format should be in an array of the object like below:
            [
              { "word": "word", "type": "vocab", "sentence": "sentence from the content", "meaning": "meaning of the word from content", offset: 0},
            ]
          `
        },
        { role: "user", content: JSON.stringify(transcript) }
      ],
    });


    const result = response.data.choices[0].message

    console.log({ result })

    if (!result || !result.content) {
      return res.status(500).json({ error: 'No response from OpenAI' });
    }
    const summaries = JSON.parse(result.content)


    res.status(200).json({
      [materialId]: summaries,
    });
  } catch (err) {
    console.log(err)
    res.status(500).json({ message: err.message, details: err.message });
  }
};

export function mergeTranscripts(transcripts: TranscriptResponse[]): TranscriptResponse[] {
  let mergedTranscripts: TranscriptResponse[] = [];
  let ongoingTranscript: TranscriptResponse = { text: "", duration: 0, offset: transcripts[0]?.offset ?? 0 };

  transcripts.forEach((transcript, i) => {
    ongoingTranscript.text += " " + transcript.text.trim();
    ongoingTranscript.duration += transcript.duration;
    if (['.', '!', '?'].some(char => transcript.text.trim().endsWith(char))) {
      mergedTranscripts.push({ ...ongoingTranscript }); // push a copy to prevent mutation
      ongoingTranscript = { text: "", duration: 0, offset: transcripts[i + 1]?.offset ?? 0 };
    }
  });

  if (ongoingTranscript.text !== "") mergedTranscripts.push(ongoingTranscript);

  return mergedTranscripts;
}
