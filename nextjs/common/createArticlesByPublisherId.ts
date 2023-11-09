import { Material } from '@prisma/client';
import Parser from 'rss-parser';
import { fetchMetadata } from '@/common/fetchMetadata';
import prisma from '@/db';
import nlp from 'compromise'
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const parser: Parser<CustomFeed, CustomItem> = new Parser({
  customFields: {
    item: ['image'],
  }
});
import { updatePublisherCrawledStatus } from '@/models/publisher'

export async function createArticlesByPublisherId({ publisherId }: { publisherId: string }): Promise<{ materials?: Material[] }> {
  try {

    const publisher = await prisma.publisher.findUnique({
      where: {
        id: publisherId
      }
    });

    if (!publisher || !publisher.rssUrl) {
      throw new Error(`Publisher not found: ${publisherId}`);
    }

    const feed = await parser.parseURL(publisher.rssUrl);

    if (!feed) {
      throw new Error(`Feed not found: ${publisher.rssUrl}`);
    }

    if (!feed.items) {
      throw new Error(`Feed items not found: ${publisher.rssUrl}`);
    }

    const materials = await Promise.all(feed.items.map(async (item) => {
      await sleep(2000)
      const url = item.link
      let metadata = {}
      try {
        metadata = await fetchMetadata(url as string)
      } catch (error) {
        console.error(`Error fetchMetadata: ${url}`, error.message)
        return Promise.resolve(null)
      }

      try {
        const description: string = metadata.description || item.description || item['og:description']

        let keywords = []
        if (item['keywords'] && typeof item['keywords'] === 'string') {
          keywords.push(...item['keywords'].split(','))
        }

        if (metadata.keywords && typeof metadata.keywords === 'string') {
          keywords.push(...metadata.keywords.split(','))
        }

        let topics = nlp(description).topics().out('array')
        console.log({ topics, description })
        keywords.push(...topics)

        // const materialHashtag = await Promise.all(keywords.map(async (keyword) => {
        //   let hashtag = await prisma.hashtag.findUnique({
        //     where: { name: keyword },
        //   });

        //   if (!hashtag) {
        //     hashtag = await prisma.hashtag.create({
        //       data: { name: keyword },
        //     });
        //   }

        //   return { hashtagId: hashtag.id };
        // }))

        const data = {
          title: item.title.trim(),
          type: 'article', // You can modify this based on your needs
          category: publisher.category,
          url: url,
          imageUrl: metadata.image,
          publishedAt: metadata.publishedAt ? new Date(metadata.publishedAt) : new Date(item.pubDate),
          publisherId: publisherId,
          materialHashtag: {
            // Use connectOrCreate for each keyword
            create: keywords
              .filter(keyword => keyword.trim().length > 3)
              .map((keyword) => ({
                hashtag: {
                  connectOrCreate: {
                    where: { name: keyword.trim() },
                    create: { name: keyword.trim() },
                  },
                },
              })),
          }
        }

        const result = await prisma.material.upsert({
          where: { url: url },
          create: data,
          update: data
        });
        await updatePublisherCrawledStatus({ publisherId })
        return result
      } catch (error) {
        await updatePublisherCrawledStatus({ publisherId, failed: true })
        console.error("Error: ", error.message)
        return Promise.resolve(null)
      }
    }))

    return { materials }
  } catch (error) {
    console.error(`Error fetching and storing RSS: ${publisherId}`, error.message);
  }
}