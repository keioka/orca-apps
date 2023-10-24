import { PrismaClient } from '@prisma/client';
import Parser from 'rss-parser';

const parser: Parser<CustomFeed, CustomItem> = new Parser({
  customFields: {
    item: ['image'],
  }
});

export async function fetchArticles({ publisherId }: { publisherId: string }) {

  const prisma = new PrismaClient();

  try {

    const publisher = await prisma.publisher.findUnique({
      where: {
        id: publisherId
      }
    });

    if (!publisher) {
      throw new Error(`Publisher not found: ${publisherId}`);
    }

    const feed = await parser.parseURL(publisher.url);

    if (!feed) {
      throw new Error(`Feed not found: ${publisher.url}`);
    }

    const materials = await Promise.all(feed.items.map(async (item) => {
      const data = {
        title: item.title.trim(),
        type: 'Article', // You can modify this based on your needs
        category: item.categories && typeof item.categories[0] === 'string' ? item.categories[0] : category,
        url: item.link,
        imageUrl: item.image,
        publishedAt: new Date(item.pubDate),
        externalId: item.guid,
        publisherId: publisherId
      }

      return await prisma.material.upsert({
        where: { url: data.url },
        create: data,
        update: data
      });
    }))

    return { materials }
  } catch (error) {
    console.error(`Error fetching and storing RSS: ${url}`, error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}