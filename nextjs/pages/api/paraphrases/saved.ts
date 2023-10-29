import { NextApiRequest, NextApiResponse } from 'next';
import { fetchSavedParaphrases } from '@/models/paraphrase';
import { validateToken } from '@/firebase';
import { setCurrentUser } from '@/middleware/setCurrentUser';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      await validateToken(req, res)
      await setCurrentUser(req, res)
    } catch (err) {
      console.error(err)
      return res.status(401).json({ error: 'Failed to authorize' });
    }

    try {
      if (!req.currentUser) {
        return res.status(401).json({ error: 'Unauthorized.' });
      }

      const { messageId, sentenceIndex } = req.query;

      const paraphrases = await fetchSavedParaphrases({ userId: req.currentUser.id, messageId, sentenceIndex })
      return res.status(200).json({ paraphrases });
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Failed to fetch paraphrases.' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed.' });
  }
}