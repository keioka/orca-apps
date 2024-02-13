import { NextApiRequest, NextApiResponse } from 'next';
import { createVocabs, getVocabsByMaterialId } from '@/models/material';
import { createRatings } from '@/models/material';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return await getRatingHandler(req, res);
  } else if (req.method === 'POST') {
    return await createRatingHandler(req, res);
  }
}

async function getRatingHandler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { materialId } = req.query;

    return res.status(200).json({ vocabs });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch rating.' });
  }
}

async function createRatingHandler(req: NextApiRequest, res: NextApiResponse) {
  const { materialId } = req.query;
  try {
    if (!materialId && typeof materialId !== 'string') {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    if (!req.body.rating && typeof req.body.rating !== 'number') {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    if (!req.body.type && typeof req.body.type !== 'string') {
      return res.status(400).json({ error: 'Missing required fields.' });
    }

    const ratingScore = parseInt(req.body.rating as string, 10);

    const rating = await createRatings({
      materialId: materialId as string,
      rating: ratingScore,
      type: req.body.type,
      userId: req.body.userId,
    })

    return res.status(201).json({ rating });
  } catch (error) {
    console.error('Failed to create rating', error);
    return res.status(500).json({ error: 'Failed to create rating.' });
  }
}