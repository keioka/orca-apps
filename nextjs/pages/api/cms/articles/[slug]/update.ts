import { NextApiRequest, NextApiResponse } from 'next';
import { getMaterials, createMaterial, getMaterialByUrl, upsertMaterial } from '@/models/material'
import { getEntry } from '@/common/contentful'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const entry = await getEntry(req.body.slug)
    console.log("hello", entry.update())
    return res.status(200).json({
      entry
    });
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}