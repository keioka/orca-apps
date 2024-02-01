import type { NextApiRequest, NextApiResponse } from 'next';
import { validateToken } from '@/firebase';
import { findUserById } from '@/models/user';
import { createLesson, listLessons } from '@/models/lesson';
import axios from 'axios';
import * as MessageModel from '@/models/message';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await validateToken(req, res)
  const { currentUser } = req
  if (!currentUser) {
    return res.status(401).json({ message: 'CurrentUser is empty' });
  }

  if (req.method !== 'POST') {
    return res.status(400).json({ message: 'GET' });
  }

  const sample = await createSampleHandler(req, res)

  return res.status(405).json({ message: 'Method not allowed' });
}


async function createSampleHandler(req: NextApiRequest, res: NextApiResponse) {
  const { messageId } = req.query;
  const message = await MessageModel.findMessageById(parseInt(messageId as string))
  const lessonId = message.lessonId
  const lesson = await MessageModel.fin
  try {

    return res.status(200).json({ phrases: newPhrases.filter((phrase) => phrase), messageId, sentenceIndex });

  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message });
  }
}