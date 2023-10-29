import { Material } from '@prisma/client';

import prisma from '../db'

export async function createLesson(
  {
    userId,
    materialId
  }: {
    userId: string,
    materialId: number
  }) {
  // Create a new lesson using Prisma
  const lesson = await prisma.lesson.create({
    data: {
      userId,
      materialId,
    },
  });

  return lesson;
}


export async function listLessons(userId: string) {

  const lessons = await prisma.lesson.findMany({
    where: {
      userId: userId as string,
    },
    include: {
      material: {
        include: {
          publisher: true,
        }
      }, // Include material related to the lesson
    }
  });

  return lessons
}


export async function getLesson(lessonId: string) {

  const lesson = await prisma.lesson.findUnique({
    where: {
      id: Number(lessonId)
    },
    include: {
      material: true, // Include material related to the lesson
      messages: true, // Include messages related to the lesson
    }
  })

  return lesson
}

export async function findLessonByUserAndMaterial(params: { userId: string, materialId: string }): Promise<Lesson | null> {
  return prisma.lesson.findUnique({
    where: {
      userId_materialId: params
    },
    include: {
      material: true,
      user: true,
      messages: true
    }
  });
}