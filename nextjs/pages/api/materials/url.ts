import { NextApiRequest, NextApiResponse } from 'next';
import { getMaterials, createMaterial, getMaterialByUrl } from '@/models/material'
import { fetchMetadata } from '@/common/fetchMetadata';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { url } = req.query;
    try {
      const material = await getMaterialByUrl(url)
      return res.status(200).json({ material });
    } catch (error) {
      console.error(error)
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
  return res.status(405).json({ message: 'Method not allowed' });
}