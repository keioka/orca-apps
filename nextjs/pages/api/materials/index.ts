import { NextApiRequest, NextApiResponse } from 'next';
import { getMaterials, createMaterial } from '@/models/material'
import { validateTokenWithoutError } from '@/firebase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { category, date } = req.query;
    await validateTokenWithoutError(req, res)
    const { currentUser } = req

    if (date && typeof date !== 'string') {
      return res.status(400).json({ error: 'Date must be a string' });
    }

    try {
      const material = await getMaterials({
        category: category as string,
        date: date && new Date(date as string),
        userId: currentUser?.id as string,
      });
      if (!material) {
        return res.status(404).json({ error: 'Material not found' });
      }
      return res.status(200).json(material);
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    const { name, type, category, publisher, url } = req.body;
    if (!name || !type || !category || !publisher || !url) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const materialData = { name, type, category, publisher, url };

    try {
      const createdMaterial = await createMaterial(materialData);
      return res.status(201).json(createdMaterial);
    } catch (error) {
      return res.status(500).json({ error: 'Internal server error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}