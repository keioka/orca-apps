import { Material, Rating } from '@prisma/client';

import prisma from '../db'

interface MaterialWithLesson extends Material {
  lessonId?: number | null
}

export async function getMaterialByExternalId(externalId: string): Promise<Material | null> {
  return await prisma.material.findUnique({
    where: {
      externalId,
    },
    include: {
      publisher: true,
    },
  });
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
  publisherIds?: string[];
}

interface PaginationResult<T> {
  items: T[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
}

export async function getMaterials(params: GetMaterialsParams): Promise<PaginationResult<MaterialWithLesson[]>> {
  const where: Prisma.MaterialWhereInput = {
    publisher: {
      isActive: true
    }
  };

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

  if (params.publisherIds) {
    where.publisherId = { in: params.publisherIds };
  }

  // Retrieve the materials for the current page
  const items = await prisma.material.findMany({
    where,
    skip: parseInt(params.offset),
    take: parseInt(params.limit), // 'take' in Prisma acts like 'limit' in many SQL databases
    orderBy: {
      publishedAt: 'desc', // or 'desc' for descending order
    },
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

  console.log({ publisherData })
  // TODO: This is a temporary workaround to handle the case where the publisher is not yet in the database
  let existingPublisherId = publisherData?.id;
  if (!existingPublisherId && publisherData && publisherData.domain) {
    const existingPublisher = await prisma.publisher.findUnique({
      where: { domain: publisherData.domain }
    });
    existingPublisherId = existingPublisher?.id;
  } else if (!existingPublisherId && publisherData && publisherData.domain) {

  } else {
    const existingPublisher = await prisma.publisher.create({
      data: {
        name: publisherData.name,
        domain: publisherData.url,
        isActive: true
      }
    });
    existingPublisherId = existingPublisher?.id;
  }

  const publisherAction = existingPublisherId
    ? { connect: { id: existingPublisherId as string } }
    : { create: publisherData as Material };

  console.log({
    publisherAction,
    materialData
  })

  delete materialData.publisher;

  const data = {
    ...materialData,
    publisher: publisherAction
  }

  console.log(JSON.stringify({ data }))

  const material = await prisma.material.create({
    data: data,
    include: {
      publisher: true,
    },
  });
  return material;
}

export async function upsertMaterial(materialData: Omit<Material, 'id'>): Promise<Material> {
  return await prisma.material.upsert({
    where: { url: materialData.url },
    create: materialData,
    update: materialData
  });
}

export async function updateMaterial(materialData: Omit<Material, 'id'>): Promise<Material> {
  return await prisma.material.update({
    where: { url: materialData.url },
    data: materialData
  });
}


interface VocabParams {
  id?: string;
  word: string;
  pronounce: string;
  meaning: string;
  sentence: string;
  translation: string;
  langCode: string
  example: string;
  paragraphNumber: number;
  pos: string;
}

interface Vocab {
  id: string;
}

export async function createVocabs({ materialId, vocabParams }: { materialId: string, vocabParams: VocabParams[] }): Promise<Vocab> {
  let result = []
  for (let vocabParam of vocabParams) {
    try {
      const vocabs = await prisma.vocabulary.create({
        data: {
          word: vocabParam.word,
          meaning: vocabParam.meaning,
          sentence: vocabParam.sentence,
          pronounce: vocabParam.pronounce,
          example: vocabParam.example,
          pos: vocabParam.pos,
          paragraphNumber: vocabParam.paragraphNumber,
          externalId: vocabParam.id,
          material: {
            connect: {
              id: materialId
            }
          },
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

      console.log({ vocabs })
      result.push(vocabs)
    } catch (error: any) {
      if (error.code === 'P2002') {
        console.log(`Vocab already exists: ${error.meta.target[0].name}`)
      } else {
        console.error(error)
      }
    }
  }
  return result
}


export async function createSummary({ materialId, vocabParams }: { materialId: string, vocabParams: VocabParams[] }): Promise<Vocab> {
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

export async function getVocabsByMaterialId({ materialId, langCode = 'ja' }: { materialId: string, langCode: string }): Promise<Vocab[]> {
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

export async function search(text: string) {
  const materials = await prisma.material.findMany({
    where: {
      title: {
        search: text
      }
    },
    take: parseInt(100), // 'take' in Prisma acts like 'limit' in many SQL databases
    orderBy: {
      publishedAt: 'desc', // or 'desc' for descending order
    },
    include: {
      publisher: true,
    },
  });

  return materials
}

export async function getOriginalMaterials(isIncludeArchived: boolean): Promise<Material[]> {
  const where = {
    publisherId: process.env.ORCA_PUBLISHER_ID,
  }

  if (!isIncludeArchived) {
    where.isArchived = false
  }

  const materials = await prisma.material.findMany({
    where: where,
    include: {
      publisher: true,
    },
  });

  return materials
}

export async function toggleArchive({ isArchived, materialId }: { materialId: string, isArchived: boolean }): Promise<Material> {
  const material = await prisma.material.update({
    where: {
      id: materialId
    },
    data: {
      isArchived
    },
    include: {
      publisher: true,
    },
  });

  return material
}

interface CreateRatingParams {
  materialId: string;
  rating: number;
  type: string;
  userId: string;
}

export async function createRatings(createRatingParams: CreateRatingParams): Promise<Rating> {
  return await prisma.rating.create({
    data: {
      materialId: createRatingParams.materialId,
      userId: createRatingParams.userId,
      rating: createRatingParams.rating,
      type: createRatingParams.type,
    }
  });
}