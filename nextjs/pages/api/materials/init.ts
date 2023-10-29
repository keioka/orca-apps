import { NextApiRequest, NextApiResponse } from 'next';
import { getMaterials, createMaterial, getMaterialByUrl } from '@/models/material'
import { fetchMetadata } from '@/common/fetchMetadata';
import { addInitialPublisherAndMaterials } from '@/utils/rss';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      addInitialPublisherAndMaterials()
      return res.status(201).json({ message: 'Success' });
    } catch (error) {
      console.error(error)
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
  return res.status(405).json({ message: 'Method not allowed' });
}