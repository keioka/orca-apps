import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { validateToken } from '@/firebase';
import { findUserById } from '@/models/user';
import { createLesson, listLessons } from '@/models/lesson';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await validateToken(req, res)
  const { currentUser } = req
  if (!currentUser) {
    return res.status(401).json({ message: 'CurrentUser is empty' });
  }

  const user = await findUserById(currentUser.id)
  if (!user) {
    return res.status(401).json({ message: 'User is not in DB' });
  }

  if (req.method === 'POST') {
    const { materialId } = req.body;
    if (!materialId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
      const lesson = await createLesson({
        userId: user.id as string,
        materialId,
      })
      return res.status(200).json(lesson);
    } catch (err) {
      console.error(err)
      return res.status(500).json({ message: 'Something went wrong' });
    }
  }

  if (req.method === 'GET') {
    const lessons = await listLessons(user.id)
    return res.status(200).json(lessons);
  }

  return res.status(405).json({ message: 'Method not allowed' });
}