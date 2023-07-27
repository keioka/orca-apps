import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { getLesson } from '@/models/lesson';
import { validateToken } from '@/firebase';

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { lessonId } = req.query;

    await validateToken(req, res)

    if (!lessonId) {
      return res.status(400).json({ message: 'Lesson id required' });
    }

    if (typeof lessonId !== 'string') {
      return res.status(400).json({ message: 'Lesson id must be a string' });
    }

    try {
      const lesson = await getLesson(lessonId)

      if (!lesson) {
        return res.status(404).json({ message: 'Lesson not found' });
      }

      return res.status(200).json(lesson);
    } catch (err) {
      res.status(500).json({ message: 'Something went wrong' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}



