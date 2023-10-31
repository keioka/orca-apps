import prisma from '../db'

export function getPublisherByDomain(domain: string) {
  return prisma.publisher.findUnique({
    where: {
      domain: domain
    }
  })
}


interface FollowPublishersInput {
  publisherId: string;
  userId: string;
}

export function followPublishers({ publishers }: { publishers: FollowPublishersInput[] }) {
  return prisma.followRss.createMany({
    data: publishers,
    skipDuplicates: true
  })
}

export function getFollowPublishers({ userId }: { userId: string }) {
  return prisma.followRss.findMany({
    where: {
      userId: userId
    }
  })
}