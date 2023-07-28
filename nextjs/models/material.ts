import { Prisma, PrismaClient, Material } from '@prisma/client';

const prisma = new PrismaClient();

interface MaterialWithLesson extends Material {
  lessonId?: number | null
}

export async function getMaterialById(id: string): Promise<Material | null> {
  const material = await prisma.material.findUnique({
    where: {
      id: Number(id),
    },
    include: {
      publisher: true,
    },
  });
  return material;
}

// Retrieve a material by ID
export async function getMaterials({ date, category, userId }: { date?: Date, category?: string, userId?: string }): Promise<MaterialWithLesson[]> {
  const where: Prisma.MaterialWhereInput = {};

  if (date) {
    const startDate = new Date(date);
    startDate.setUTCHours(0, 0, 0, 0);

    const endDate = new Date(date);
    endDate.setUTCHours(23, 59, 59, 999);

    where.publishedAt = { gte: startDate, lte: endDate };
  }

  if (category) {
    where.category = { equals: category };
  }

  const lessonWhere = {
    userId: {
      is: userId
    }
  }

  const materials = await prisma.material.findMany({
    where,
    include: {
      publisher: true,
    },
  });


  const lessons = await prisma.lesson.findMany({
    where: {
      materialId: {
        in: materials.map((material) => material.id),
      }
    },
  });

  const materialsWithLessonId = materials.map((material) => {
    return {
      ...material,
      lessonId: lessons.find((lesson) => {
        return lesson.materialId === material.id
      })?.id || null,
    }
  })

  return materialsWithLessonId;
}
// Create a new material
export async function createMaterial(materialData: Omit<Material, 'id'>): Promise<Material> {
  const material = await prisma.material.create({
    data: {
      ...materialData,
      publisher: {
        connectOrCreate: {
          where: {
            externalId: materialData.publisher.externalId,
          },
          create: {
            externalId: 'viola@prisma.io',
          },
        },
      }
    },
    include: {
      publisher: true,
    },
  });
  return material;
}

export async function hadPreviousLesson(ids: string) {
  const lesson = await prisma.lesson.findMany({
    where: {
      userId: ids
    }
  })
  return lesson
}