import type { NextApiRequest, NextApiResponse } from 'next';
import { getLesson } from '@/models/lesson';
import { validateToken } from '@/firebase';
import { setCurrentUser } from '@/middleware/setCurrentUser';

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { lessonId } = req.query;

    await validateToken(req, res)
    await setCurrentUser(req, res)

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
      return res.status(500).json({ message: 'Something went wrong' });
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}



