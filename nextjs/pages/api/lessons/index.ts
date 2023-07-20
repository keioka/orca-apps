import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { validateToken } from '@/supabase';
import { findUserByProviderId } from '@/models/user';
import { createLesson, listLessons } from '@/models/lesson';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { question, history } = req.body;
  await validateToken(req, res)
  const supabaseUser = req.user
  if (!supabaseUser) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const user = await findUserByProviderId(supabaseUser.id)
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (req.method === 'POST') {
    const lesson = await createLesson({
      userId: user.id as string,
      materialId: 1,
    })
    return res.status(200).json(lesson);
  }

  if (req.method === 'GET') {
    const lessons = await listLessons(user.id)
    return res.status(200).json(lessons);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

