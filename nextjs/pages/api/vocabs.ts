import { NextApiRequest, NextApiResponse } from 'next';
import createVocabsFromUrl from '@/defer/createVocabsFromUrl';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { url, materialId, transLangCode = 'ja' } = req.body;

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  if (!url && !materialId) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    await createVocabsFromUrl({ materialId, url, transLangCode });

    return res.status(200).json({ status: "IN_PROGRESS" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
}
