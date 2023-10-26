import { NextApiRequest, NextApiResponse } from 'next';
import { saveVocab } from '@/models/vocab';
import { validateToken } from '@/firebase';
import { setCurrentUser } from '@/middleware/setCurrentUser';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { vocabId } = req.query;
  await validateToken(req, res)
  await setCurrentUser(req, res)

  if (req.method === 'POST') {
    try {
      if (!vocabId) {
        return res.status(400).json({ error: 'Missing required fields.' });
      }

      if (parseInt(vocabId as string) === NaN) {
        return res.status(400).json({ error: 'Invalid vocabId.' });
      }

      if (!req.currentUser) {
        return res.status(401).json({ error: 'Unauthorized.' });
      }

      const vocabInfo = await saveVocab({ vocabId: parseInt(vocabId), userId: req.currentUser.id })
      return res.status(200).json(vocabInfo);
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Failed to save vocab.' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed.' });
  }
}