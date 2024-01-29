import { NextApiRequest, NextApiResponse } from 'next';
import * as Material from '@/models/material';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { externalId } = req.query
    const material = await Material.getMaterialByExternalId(externalId)
    res.status(200).json(material)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
}