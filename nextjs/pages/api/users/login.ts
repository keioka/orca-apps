import type { NextApiRequest, NextApiResponse } from 'next';
import { validateToken } from '@/firebase';
import { findUserById } from '@/models/user';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  //only accept post requests
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  try {
    await validateToken(req, res)
  } catch {
    return res.status(401).json({ message: 'Failed to validate token' });
  }

  if (!req.currentUser) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const userId = req.currentUser!.id

  console.log({ userId })
  if (!userId) {
    res.status(401).json({ message: 'Unauthorized' });
    return;
  }

  const user = await findUserById(userId)
  if (!user) {
    res.status(404).json({ message: 'Not found' });
    return;
  }

  return res.status(200).json(user);
}
