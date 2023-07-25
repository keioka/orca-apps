import type { NextApiRequest, NextApiResponse } from 'next';
import { validateToken } from '@/firebase';
import { findUserByProviderId } from '@/models/user';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { question, history } = req.body;

  //only accept post requests
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  await validateToken(req, res)
  const providerId = req.user?.id

  if (!providerId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }

  const user = await findUserByProviderId(providerId)

  if (!user) {
    res.status(404).json({ error: 'Not found' });
    return;
  }

  return res.status(200).json(user);
}
