import { Prisma, PrismaClient, Material } from '@prisma/client';

const prisma = new PrismaClient();

// Retrieve a material by ID
export async function getMaterials({ date, category }: { date?: Date, category?: string }): Promise<Material[]> {
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

  const materials = await prisma.material.findMany({
    where,
    include: {
      publisher: true,
    },
  });

  return materials;
}
// Create a new material
export async function createMaterial(materialData: Omit<Material, 'id'>): Promise<Material> {
  const material = await prisma.material.create({
    data: materialData,
  });
  return material;
}