import { NextApiRequest, NextApiResponse } from 'next';
import { createVocabs, getVocabsByMaterialId, getMaterialById } from '@/models/material';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return await getVocabsHandler(req, res);
  } else if (req.method === 'POST') {
    return await createVocabsHandler(req, res);
  }
}

async function getVocabsHandler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { materialId } = req.query;
    if (!materialId && typeof materialId !== 'string') {
      return res.status(400).json({ error: 'Missing required fields.' });
    }
    const vocabs = await getVocabsByMaterialId({ materialId });
    const material = await getMaterialById(materialId as string);
    return res.status(200).json({ vocabs, material, status: material.vocabGenScheduledSetCount === material?.vocabGenDoneSetCount ? "DONE" : "IN_PROGRESS" });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch vocabs.' });
  }
}

async function createVocabsHandler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { materialId } = req.query;
    const vocabs = await createVocabs({
      materialId: materialId as string,
      vocabParams: req.body.vocabs
    })

    return res.status(201).json({ vocabs });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create vocabs.' });
  }
}