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

  if (req.method === 'GET') {

  }

  return res.status(405).json({ message: 'Method not allowed' });
}
