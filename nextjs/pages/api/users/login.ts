import type { NextApiRequest, NextApiResponse } from 'next';
import { validateToken } from '@/firebase';
import { findUserById } from '@/models/user';
import { setCurrentUser } from '@/middleware/setCurrentUser';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  //only accept post requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await validateToken(req, res)
  } catch (err) {
    console.error(err)
    return res.status(401).json({ code: "INVALID_TOKEN", message: 'Failed to validate token' });
  }

  try {
    await setCurrentUser(req)
  } catch (err) {
    console.error(err)
    return res.status(401).json({ code: "NO_USER", message: err.message });
  }

  try {
    return res.status(201).json(req.currentUser);
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Something went wrong' });
  }
}
