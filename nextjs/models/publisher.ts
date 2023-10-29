import prisma from '../db'

export function getPublisherByDomain(domain: string) {
  return prisma.publisher.findUnique({
    where: {
      domain: domain
    }
  })
}