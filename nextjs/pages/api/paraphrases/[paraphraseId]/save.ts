import type { NextApiRequest, NextApiResponse } from 'next';
import { validateToken } from '@/firebase';
import { setCurrentUser } from '@/middleware/setCurrentUser';
import * as ParaphraseModel from '@/models/paraphrase';


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {

  try {
    const { error } = await validateToken(req, res)
    if (error) {
      return res.status(401).json({ error });
    }

    await setCurrentUser(req, res)
    if (req.currentUser?.id === undefined) {
      return res.status(401).json({ error: { code: "AUTH/NOT_FOUND", error: "follow: Unauthorized" } });
    }
  } catch (error) {
    console.error(error)
    return res.status(401).json({ error: { code: "AUTH/NOT_FOUND", message: 'AUTH_NOT_FOUND' } });
  }

  try {
    if (req.method === 'POST') {
      return await saveParaphraseHandler(req, res)
    }
    return res.status(405).json({ message: 'Method not allowed' });
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: { code: "PARAPHRASE/ERROR", message: err.message } });
  }
}

async function saveParaphraseHandler(req: NextApiRequest, res: NextApiResponse) {
  const { paraphraseId } = req.query;
  const { currentUser } = req
  try {
    const isAllowed = await ParaphraseModel.pCheckSaveParaphrase({ paraphraseId, userId: currentUser.id })

    if (!isAllowed) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    const savedPhraseInfo = await ParaphraseModel.saveParaphrase({ paraphraseId, userId: currentUser.id })

    return res.status(200).json({ savedPhraseInfo });
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: { code: "PARAPHRASE/ERROR", message: "saveParaphraseHandler: Internal Server Error" } });
  }
}