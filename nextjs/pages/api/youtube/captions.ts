import { NextApiRequest, NextApiResponse } from 'next';
import { YoutubeTranscript } from 'youtube-transcript';
import { getMaterialById } from '@/models/material';

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
    res.status(200).json({
      [materialId]: mergeTranscripts(transcript)
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
