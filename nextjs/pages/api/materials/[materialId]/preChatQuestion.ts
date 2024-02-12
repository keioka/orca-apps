import { NextApiRequest, NextApiResponse } from 'next';
import { createVocabs, getMaterialById } from '@/models/material';
import { getQuestionsByMaterialId, createQuestions } from '@/models/question';
import { getEntry, getEntryWithLocale, updateEntry, getEntryRaw } from '@/common/contentful'
import { questions } from '@/utils/openai/questions'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    return await createPreChatQuestionsHandler(req, res);
  }
}

async function createPreChatQuestionsHandler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const materialId = req.query.materialId
    const material = await getMaterialById(materialId)
    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    const quetions = await getQuestionsByMaterialId(material.id)

    if (quetions.length > 0) {
      return res.status(200).json({ quetions });
    }

    const entryId = material.externalId

    if (!entryId) {
      return res.status(400).json({ message: 'Entry is not found in contentful' });
    }

    const entry = await getEntry(entryId)

    const p1 = entry.fields.p1
    const p2 = entry.fields.p2
    const p3 = entry.fields.p3
    const p4 = entry.fields.p4
    const p5 = entry.fields.p5
    const p6 = entry.fields.p6

    const [p1Questions, p2Questions, p3Questions, p4Questions, p5Questions] = await Promise.all([
      questions({ text: p1 }),
      questions({ text: p2 }),
      questions({ text: p3 }),
      questions({ text: p4 }),
      questions({ text: p5 }),
      questions({ text: p6 })
    ])

    const preChatQuestions = await createQuestions([
      ...p1Questions.map(q => ({ content: q.question, materialId: material.id, paragraphNumber: 1, translation: { content: q.jaQuestion, langCode: 'ja' } })),
      ...p2Questions.map(q => ({ content: q.question, materialId: material.id, paragraphNumber: 2, translation: { content: q.jaQuestion, langCode: 'ja' } })),
      ...p3Questions.map(q => ({ content: q.question, materialId: material.id, paragraphNumber: 3, translation: { content: q.jaQuestion, langCode: 'ja' } })),
      ...p4Questions.map(q => ({ content: q.question, materialId: material.id, paragraphNumber: 4, translation: { content: q.jaQuestion, langCode: 'ja' } })),
      ...p5Questions.map(q => ({ content: q.question, materialId: material.id, paragraphNumber: 5, translation: { content: q.jaQuestion, langCode: 'ja' } }))
    ])

    return res.status(201).json({
      quetions: preChatQuestions
    });

  } catch (error) {
    console.error(error)
    return res.status(500).json({ error: 'Failed to create vocabs.' });
  }
}