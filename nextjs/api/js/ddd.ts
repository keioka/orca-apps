import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { validateToken } from '@/supabase';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { question, history } = req.body;

  if (req.method === 'POST') {
    await createLesson(req, res)
    return;
  }

  if (req.method === 'GET') {
    await listLessons(req, res)
    return
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

async function listLessons(req: NextApiRequest, res: NextApiResponse) {
  await validateToken(req, res);
  const { user } = req
  console.log({ user })
  if (!user) {
    return res.status(400).json({ message: 'User id required' });
  }

  try {
    const lessons = await prisma.lesson.findMany({
      where: {
        userId: user.id as string,
      },
    });

    return res.status(200).json(lessons);
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong' });
  } finally {
    async () => {
      await prisma.$disconnect();
    };
  }
}

async function createLesson(req: NextApiRequest, res: NextApiResponse) {

  const userId = "1";
  const { materialId } = req.body;

  if (!userId || !materialId) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const newLesson = await prisma.lesson.create({
      data: {
        userId,
        materialId,
      },
    });

    return res.status(200).json(newLesson);
  } catch (err) {
    res.status(500).json({ error: 'Something went wrong' });
  } finally {
    async () => {
      await prisma.$disconnect();
    };
  }
}
