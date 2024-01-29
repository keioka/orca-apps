import { NextApiRequest, NextApiResponse } from 'next';
import { getMaterials, createMaterial, getMaterialByUrl, upsertMaterial } from '@/models/material'
import { getAllArticles, formatEntries } from '@/common/contentful'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const contentfulArticles = await getAllArticles()
    const items = contentfulArticles.items
    const articles = formatEntries(items)
    return res.status(200).json({ articles });
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}