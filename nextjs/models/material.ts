import { Prisma, PrismaClient, Material } from '@prisma/client';

const prisma = new PrismaClient();

interface MaterialWithLesson extends Material {
  lessonId?: number | null
}

export async function getMaterialById(id: string): Promise<Material | null> {
  return await prisma.material.findUnique({
    where: {
      id,
    },
    include: {
      publisher: true,
    },
  });
}


export async function getMaterialByUrl(url: string): Promise<Material | null> {
  const material = await prisma.material.findUnique({
    where: {
      url: url,
    },
    include: {
      publisher: true,
    },
  });
  return material;
}

interface GetMaterialsParams {
  date?: Date;
  category?: string;
  offset?: number; // Offset for pagination
  limit?: number; // Maximum number of records to retrieve for pagination
}

interface PaginationResult<T> {
  items: T[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
}

export async function getMaterials(params: GetMaterialsParams): Promise<PaginationResult<MaterialWithLesson[]>> {
  const where: Prisma.MaterialWhereInput = {};

  if (params.date) {
    const startDate = new Date(params.date);
    startDate.setUTCHours(0, 0, 0, 0);

    const endDate = new Date(params.date);
    endDate.setUTCHours(23, 59, 59, 999);

    where.publishedAt = { gte: startDate, lte: endDate };
  }

  if (params.category) {
    where.category = { equals: params.category };
  }

  // Retrieve the materials for the current page
  const items = await prisma.material.findMany({
    where,
    skip: parseInt(params.offset),
    take: parseInt(params.limit), // 'take' in Prisma acts like 'limit' in many SQL databases
    include: {
      publisher: true,
    },
  });

  // Count the total number of materials that match the query
  const totalItems = await prisma.material.count({ where });

  // Calculate current page and total pages
  const currentPage = params.offset ? (params.offset / params.limit!) + 1 : 1;
  const totalPages = Math.ceil(totalItems / (params.limit || totalItems));

  return {
    items,
    totalItems,
    currentPage,
    totalPages,
  };
}

// Create a new material
export async function createMaterial(materialData: Omit<Material, 'id'>): Promise<Material> {
  const publisherData = materialData.publisher;

  let existingPublisher;
  if (publisherData && publisherData.domain) {
    existingPublisher = await prisma.publisher.findUnique({
      where: { domain: publisherData.domain }
    });
  }

  const publisherAction = existingPublisher
    ? { connect: { id: existingPublisher.id } }
    : { create: publisherData };


  const material = await prisma.material.create({
    data: {
      ...materialData,
      publisher: publisherAction
    },
    include: {
      publisher: true,
    },
  });
  return material;
}

interface VocabParams {
  word: string;
  pronounce: string;
  meaning: string;
  sentence: string;
  translation: string;
  langCode: string
  example: string;
}

interface Vocab {
  id: string;
}

export async function createVocabs({ materialId, vocabParams }: { materialId: string, vocabParams: VocabParams[] }): Promise<Vocab> {
  // const vocabulariesToCreate = vocabParams.map(vocab => ();

  for (let vocabParam of vocabParams) {
    await prisma.vocabulary.create({
      data: {
        word: vocabParam.word,
        meaning: vocabParam.meaning,
        materialId: materialId,
        sentence: vocabParam.sentence,
        pronounce: vocabParam.pronounce,
        example: vocabParam.example,
        translation: {
          create: {
            content: vocabParam.translation,
            language: {
              connect: {
                code: vocabParam.langCode
              }
            }
          }
        }
      }
    })
  }
}

export async function getVocabsByMaterialId({ materialId, langCode }: { materialId: string, langCode: string }): Promise<Vocab[]> {
  const vocabs = await prisma.vocabulary.findMany({
    where: {
      materialId
    },
    include: {
      translation: {
        where: {
          language: {
            code: langCode
          }
        }
      }
    }
  });
  return vocabs;
}


export async function hadPreviousLesson(ids: string) {
  const lesson = await prisma.lesson.findMany({
    where: {
      userId: ids
    }
  })
  return lesson
}