import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function createSummary({
  level,
  content,
  materialId,
}: {
  level: string;
  content: string;
  materialId: string;
}) {
  const newSummary = await prisma.summary.create({
    data: {
      level,
      content,
      material: {
        connect: {
          id: materialId,
        }
      }
    },
  });
  return newSummary;
}

export async function fetchSummaryBy({ materialId, level }: { materialId: string, level: string }) {
  const summary = await prisma.summary.findFirst({
    where: {
      materialId,
      level
    }
  });
  return summary;
}