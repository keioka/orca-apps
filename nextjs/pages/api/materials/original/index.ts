import { NextApiRequest, NextApiResponse } from 'next';
import * as Material from '@/models/material';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { isIncludeArchived } = req.query
    const materials = await Material.getOriginalMaterials(!!isIncludeArchived)
    res.status(200).json({ materials })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
}