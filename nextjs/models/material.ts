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
  type: string;
  sentence: string;
  meaning: string;
  translation: string;
}

interface Vocab {
  id: string;
  word: string;
  type: string;
  sentence: string;
  meaning: string;
  translation: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function createVocabs(materialId: number, vocabParams: VocabParams[]): Promise<Vocab> {
  const vocabulariesToCreate = vocabParams.map(vocab => ({
    name: vocab.word, // Assuming the name is the same as the word
    word: vocab.word,
    meaning: vocab.meaning,
    materialId: materialId
  }));

  await prisma.vocabulary.createMany({
    data: vocabulariesToCreate,
    skipDuplicates: true,
  });

  const newVocabs = await prisma.vocabulary.findMany({
    where: {
      materialId: materialId
    }
  })

  return newVocabs
}


export async function hadPreviousLesson(ids: string) {
  const lesson = await prisma.lesson.findMany({
    where: {
      userId: ids
    }
  })
  return lesson
}