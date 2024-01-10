import { NextApiRequest, NextApiResponse } from 'next';
import { toggleArchive } from '@/models/material';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    return await handleArchive(req, res);
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

async function handleArchive(req: NextApiRequest, res: NextApiResponse) {
  const { materialId } = req.query;
  const { isArchived = true } = req.body;

  try {
    const material = await toggleArchive({ materialId, isArchived });
    return res.status(200).json(material);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to archive material' });
  }
}

