import type { NextApiRequest, NextApiResponse } from 'next';
import { validateToken } from '@/firebase';
import { findUserById } from '@/models/user';
import { createLesson, listLessons } from '@/models/lesson';
import axios from 'axios';

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
    return res.status(200).json({ message: 'GET' });
  }

  const { text } = req.body;

  const result = await axios.request({
    method: 'POST',
    url: 'https://api.edenai.run/v2/text/spell_check',
    headers: {
      authorization: `Bearer ${process.env.EDENAI_API_KEY}`
    },
    data: {
      providers: 'prowritingaid',
      text,
      language: 'en'
    }
  })

  const data = result.data

  return res.status(405).json({ message: 'Method not allowed' });
}
