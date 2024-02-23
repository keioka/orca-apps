import type { NextApiRequest, NextApiResponse } from 'next';
import { validateToken } from '@/firebase';
import { setCurrentUser } from '@/middleware/setCurrentUser';
import { findUserById } from '@/models/user';
import { createLesson, listLessons } from '@/models/lesson';
import axios from 'axios';
import * as MessageModel from '@/models/message';
import * as LessonModel from '@/models/lesson';
import * as MaterialModel from '@/models/material';
import * as VocabularyModel from '@/models/vocab';
import { sample } from '@/utils/openai/sample';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  await validateToken(req, res)
  await setCurrentUser(req, res)

  const { currentUser } = req

  if (!currentUser) {
    return res.status(401).json({ message: 'CurrentUser is empty' });
  }

  if (req.method !== 'POST') {
    return res.status(400).json({ message: 'GET is not allowed' });
  }

  try {
    await createSampleHandler(req, res)
  } catch (error) {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}

async function createSampleHandler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { lessonId } = req.query;
    const lesson = await LessonModel.getLesson(parseInt(lessonId as string))

    const materialId = lesson.materialId
    const material = await MaterialModel.getMaterialById(materialId)

    const currentUser = req.currentUser

    const savedVocabulariesByUserId = await VocabularyModel.fetchSavedVocab(currentUser.id)

    const history = lesson.messages.map((message) => ({ content: message.content, type: message.type }))
    const vocabularies = savedVocabulariesByUserId.filter((vocabData) => vocabData.vocabulary.material.id === materialId).map((v) => v.vocabulary.word)

    const samples = await sample({
      url: material.url,
      history,
      vocabularies: vocabularies,
    })

    return res.status(200).json({ samples, vocabularies, history });
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message });
  }
}