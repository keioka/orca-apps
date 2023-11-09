import { NextApiRequest, NextApiResponse } from 'next';
import { fetchSavedParaphrases } from '@/models/paraphrase';
import { validateToken } from '@/firebase';
import { setCurrentUser } from '@/middleware/setCurrentUser';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  try {
    const { error } = await validateToken(req, res)
    if (error) {
      return res.status(401).json({ error });
    }

    await setCurrentUser(req, res)
    if (req.currentUser?.id === undefined) {
      return res.status(401).json({ code: "AUTH/NOT_FOUND", error: "follow: Unauthorized" });
    }
  } catch (error) {
    console.error(error)
    return res.status(401).json({ code: "AUTH/NOT_FOUND", message: 'AUTH_NOT_FOUND' });
  }

  if (req.method === 'GET') {

    try {
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