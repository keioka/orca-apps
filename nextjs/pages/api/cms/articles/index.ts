import { NextApiRequest, NextApiResponse } from 'next';
import { getMaterials, createMaterial, getMaterialByUrl, upsertMaterial } from '@/models/material'
import { getAllArticles, formatEntries } from '@/common/contentful'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const contentfulArticles = await getAllArticles()
      const items = contentfulArticles.items
      const articles = formatEntries(items)
      return res.status(200).json({ articles });
    } catch (err) {
      console.error(err)
      return res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}