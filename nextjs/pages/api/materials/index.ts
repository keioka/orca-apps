import { NextApiRequest, NextApiResponse } from 'next';
import { getMaterials, createMaterial, getMaterialByUrl } from '@/models/material'
import { validateTokenWithoutError } from '@/firebase';
import { fetchMetadata } from '@/common/fetchMetadata';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { category, date, offset, limit } = req.query;

    if (date && typeof date !== 'string') {
      return res.status(400).json({ message: 'Date must be a string' });
    }

    try {
      const material = await getMaterials({
        category: category as string,
        date: date && new Date(date as string),
        offset,
        limit
      });
      if (!material) {
        return res.status(404).json({ message: 'Material not found' });
      }
      return res.status(200).json(material);
    } catch (error) {
      console.error(error)
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
      const cleanURL = new URL(url)
      const material = await getMaterialByUrl(cleanURL.href as string)
      console.log({ material, url })
      if (material) {
        return res.status(200).json(material);
      }

      const metadata = await fetchMetadata(url as string)

      const materialData = {
        url: url as string,
        title: metadata.title,
        imageUrl: metadata.image,
        type: "article",
        publishedAt: metadata.publishedAt,
        externalId: metadata.externalId,
        category: metadata.category,
        publisher: metadata.publisher,
      }

      console.log({ materialData })

      const createdMaterial = await createMaterial(materialData);
      return res.status(201).json(createdMaterial);
    } catch (error) {
      console.error(error)
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}