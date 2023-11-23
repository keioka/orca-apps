import { Publisher } from '@prisma/client'; // Import Prisma and PublisherUpdateInput from Prisma client
import prisma from '../db'

export function getPublisherByDomain(domain: string) {
  return prisma.publisher.findUnique({
    where: {
      domain: domain
    }
  })
}

export function getRecommendedPublishers() {
  return prisma.publisher.findMany({
    where: {
      isRecommended: true
    }
  })
}

export async function followRecommnededPublishers({ userId }: { userId: string }) {
  const publishers = await getRecommendedPublishers()
  const data = publishers.map((publisher) => {
    return { publisherId: publisher.id, userId: userId }
  })

  console.log(data)
  return followPublishers({ publishers: data })
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

export function checkPublishersCrawledStatus() {
  const anHourAgo = new Date(new Date().getTime() - 60 * 60 * 1000);
  return prisma.publisher.findMany({
    where: {
      OR: [
        { lastCrawledAt: null },
        {
          lastCrawledAt: {
            lt: anHourAgo,
          },
        },
      ],
      isActive: true, // Assuming you want to check only active publishers
    },
  });
}

// 
export function updatePublisherCrawledStatus({ publisherId, failed }: { publisherId: string, failed?: boolean }) {
  const data: any = {};
  if (failed) {
    data.lastCrawlFailedAt = new Date();
  } else {
    data.lastCrawledAt = new Date()
  }

  return prisma.publisher.update({
    where: {
      id: publisherId,
    },
    data,
  });
}

export function updatePublisherInfo(publisherId: string, updateData: Publisher) {
  return prisma.publisher.update({
    where: {
      id: publisherId,
    },
    data: updateData,
  });
}

export function deactivatePublishers(publisherIds: string[]) {
  return prisma.publisher.updateMany({
    where: {
      id: {
        in: publisherIds,
      },
    },
    data: {
      isActive: false,
    },
  });
}
