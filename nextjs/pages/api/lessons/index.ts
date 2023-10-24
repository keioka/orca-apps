import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { validateToken } from '@/firebase';
import { findUserById } from '@/models/user';
import { createLesson, listLessons } from '@/models/lesson';
import { setCurrentUser } from '@/middleware/setCurrentUser';
import * as Material from '@/models/material';
import { fetchAndParseWebsite } from '@/utils/webParser';
import { findLessonByUserAndMaterial } from '@/models/lesson';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    await validateToken(req, res)
    await setCurrentUser(req, res)
  } catch (err) {
    return res.status(401).json({ message: 'Unauthorized' });
  }


  if (req.method === 'POST') {
    return await createNewLessonHandler(req, res)
  }

  if (req.method === 'GET') {
    return await getLessonsHandler(req, res)
  }

  return res.status(405).json({ message: 'Method not allowed' });
}


async function getLessonsHandler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { currentUser } = req
  const lessons = await listLessons(currentUser.id)
  return res.status(200).json(lessons);
}

async function createNewLessonHandler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { currentUser } = req
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {

    const { material, error } = await getOrCreateMaterialByUrl(url)
    if (error) {
      return res.status(400).json({ message: error });
    }

    console.log({ material })

    const params = { userId: currentUser.id, materialId: material.id }
    const existingLesson = await findLessonByUserAndMaterial(params)

    if (existingLesson) {
      return res.status(400).json({ message: 'Lesson already exists' });
    }

    const lesson = await createLesson(params)
    return res.status(200).json(lesson);
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Something went wrong' });
  }
}


async function getOrCreateMaterialByUrl(url: string) {
  let material = await Material.getMaterialByUrl(url)
  if (!material) {
    if (!url) {
      console.error("url is required");
      return { error: 'Missing required fields' };
    }

    const result = await fetchAndParseWebsite(url)

    if (!result) {
      return { error: 'Failed to fetch url' };
    }

    material = await Material.createMaterial({
      url: url,
      title: result.title,
      category: result.category,
      imageUrl: result.imageUrl,
      type: "article",
      publisher: {
        contentType: "article",
        publisherType: "website",
        name: result.publisherName,
        domain: result.domain,
      }
    })
  }

  return { material }
}