import { NextApiRequest, NextApiResponse } from 'next';
import { getVocabsByMaterialId } from '@/models/material';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { materialId } = req.query;

  if (req.method === 'GET') {
    try {
      const vocabs = await getVocabsByMaterialId(materialId as string);
      return res.status(200).json({ vocabs });
    } catch (error) {
      return res.status(500).json({ error: 'Failed to fetch vocabs.' });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed.' });
  }
}