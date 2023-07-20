import { Prisma, PrismaClient, Material } from '@prisma/client';

const prisma = new PrismaClient();

export async function createLesson(
  {
    userId,
    materialId
  }: {
    userId: string,
    materialId: number
  }) {
  try {
    // Create a new lesson using Prisma
    const lesson = await prisma.lesson.create({
      data: {
        userId,
        materialId,
      },
    });

    return lesson;
  } catch (err) {
    console.error(err);
  }
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


export async function getLesson(lessopnId: string) {

  const lesson = await prisma.lesson.findUnique({
    where: {
      id: Number(lessopnId)
    },
    include: {
      material: true, // Include material related to the lesson
      messages: true, // Include messages related to the lesson
    }
  })

  return lesson
}



