import prisma from '@/db';
import Parser from 'rss-parser';
import { fetchMetadata } from '@/common/fetchMetadata';
import nlp from 'compromise'

const parser: Parser<CustomFeed, CustomItem> = new Parser({
  customFields: {
    item: ['image'],
  }
});

export async function fetchArticles({ publisherId }: { publisherId: string }) {

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

      const metadata = await fetchMetadata(item.url as string)

      const description: string = item.description || item['og:description']

      let keywords = []
      if (item['keywords']) {
        keywords.push(...item['keywords'].split(','))
      }

      let topics = nlp(description).topics().out('array')
      keywords.push(...topics)

      const url = item.link || item['og:url']
      const data = {
        title: item.title.trim(),
        type: 'article', // You can modify this based on your needs
        category: metadata.image,
        url: url,
        imageUrl: item.image,
        publishedAt: new Date(item.pubDate),
        externalId: item.guid,
        publisherId: publisherId,
        hashtags: {
          createMany: {
            data: keywords.map((keyword) => ({ name: keyword }))
          }
        },
      }

      return await prisma.material.upsert({
        where: { url: url },
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