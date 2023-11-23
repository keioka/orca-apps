import { fetchAndStoreRSS } from "@/common/fetchRSS";
import Parser from 'rss-parser';
import { fetchMetadata } from '@/common/fetchMetadata';
import nlp from 'compromise'
import { getPublishedDate } from '@/common/createArticlesByPublisherId';

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const parser: Parser<CustomFeed, CustomItem> = new Parser({
  customFields: {
    item: ['image'],
  }
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { url } = req.body;

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const feed = await parser.parseURL(url);

    const materials = await Promise.all(feed.items.map(async (item, index) => {
      await sleep(1000 * index)
      const url = item.link
      let metadata = {}
      try {
        metadata = await fetchMetadata(url as string)
      } catch (error) {
        console.error(`Error fetchMetadata: ${url}`, error.message)
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

        const publishedAt = getPublishedDate(item, metadata)

        const data = {
          title: item.title.trim(),
          type: 'article', // You can modify this based on your needs
          category: "test",
          url,
          imageUrl: metadata.image,
          publishedAt,
          publisherId: "test",
          // materialHashtag: {
          //   // Use connectOrCreate for each keyword
          //   create: keywords
          //     .filter(keyword => keyword.trim().length > 3)
          //     .map((keyword) => ({
          //       hashtag: {
          //         connectOrCreate: {
          //           where: { name: keyword.trim() },
          //           create: { name: keyword.trim() },
          //         },
          //       },
          //     })),
          // }
        }

        return data
      } catch (error) {
        console.error('Error creating material', error.message)
        return { err: error.message }
      }
    }))

    return res.status(200).json({ feed, materials });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
