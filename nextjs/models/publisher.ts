import { PrismaClient } from "@prisma/client";

export function getPublisherByDomain(domain: string) {
  const prisma = new PrismaClient();
  return prisma.publisher.findUnique({
    where: {
      domain: domain
    }
  })
}