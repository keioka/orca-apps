import prisma from '../db'

export function getPublisherByDomain(domain: string) {
  return prisma.publisher.findUnique({
    where: {
      domain: domain
    }
  })
}

export function getPublisherById(id: string) {
  return prisma.publisher.findUnique({
    where: {
      id: id
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
    },
    include: {
      publisher: {
        select: {
          id: true,
          category: true
        }
      }
    }
  })
}


export function getFollowPublishersCategory({ userId }: { userId: string }) {
  return prisma.publisher.groupBy({
    where: {
      followRss: {
        some: {
          userId: userId
        }
      }
    },
    by: ["category"]
  })
}

export function createPublishers(publishers: any[]) {
  return prisma.publisher.createMany({
    data: publishers,
    skipDuplicates: true
  })
}