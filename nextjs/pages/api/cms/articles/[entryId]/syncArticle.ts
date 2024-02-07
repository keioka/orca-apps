import { NextApiRequest, NextApiResponse } from 'next';
import { syncArticleByExternalId } from '@/common/contentful/syncArticle';

export const maxDuration = 300; // This function can run for a maximum of 5 seconds

const retryConfig = {
  retries: 5,
  onFailedAttempt: error => {
    console.warn(`Attempt ${error.attemptNumber} failed. There are ${error.retriesLeft} retries left.`);
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { newArticle, isNew, addedVocabs } = await syncArticleByExternalId(req.query.entryId)
      return res.status(200).json({ newArticle, isNew, addedVocabs })
    } catch (error) {
      console.error(error)
      return res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}