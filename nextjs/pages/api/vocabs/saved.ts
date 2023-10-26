import { NextApiRequest, NextApiResponse } from 'next';
import { fetchSavedVocab } from '@/models/vocab';
import { validateToken } from '@/firebase';
import { setCurrentUser } from '@/middleware/setCurrentUser';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await validateToken(req, res)
  await setCurrentUser(req, res)

  if (req.method === 'GET') {
    try {
      if (!req.currentUser) {
        return res.status(401).json({ error: 'Unauthorized.' });
      }

      const vocabs = await fetchSavedVocab({ userId: req.currentUser.id })
      return res.status(200).json({ vocabs });
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Failed to fetch vocab.' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed.' });
  }
}