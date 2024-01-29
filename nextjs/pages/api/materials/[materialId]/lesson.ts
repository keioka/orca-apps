import { NextApiRequest, NextApiResponse } from 'next';
import { findLessonByUserAndMaterial, createLesson } from '@/models/lesson';
import { validateToken } from '@/firebase';
import { setCurrentUser } from '@/middleware/setCurrentUser';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    return await handleFetchLessonByMaterial(req, res);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function handleFetchLessonByMaterial(req: NextApiRequest, res: NextApiResponse) {
  const { materialId } = req.query;

  try {
    await validateToken(req, res)
  } catch (err) {
    console.error(err)
    return res.status(401).json({ message: 'Failed to validate token' });
  }

  try {
    await setCurrentUser(req)
  } catch (err) {
    console.error(err)
    return res.status(401).json({ message: 'Failed to validate token' });
  }

  const currentUser = req.currentUser;

  try {
    let lesson = await findLessonByUserAndMaterial({ materialId, userId: currentUser.id });

    if (!lesson) {
      lesson = await createLesson({ materialId, userId: currentUser.id });
    }

    return res.status(200).json(lesson);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to archive material' });
  }
}

