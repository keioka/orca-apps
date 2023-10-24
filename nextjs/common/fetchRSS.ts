// import axios from 'axios';
// import { parseString } from 'xml2js';
import { PrismaClient } from '@prisma/client';
import Parser from 'rss-parser';

type CustomFeed = { item: string };
type CustomItem = { image: string };

const parser: Parser<CustomFeed, CustomItem> = new Parser({
  customFields: {
    item: ['image'],
  }
});


interface RSSItem {
  title: string;
  link: string;
  guid: string;
  content: string;
  pubDate: string;
  category?: string[];
  image?: string;
}

interface RSSChannel {
  title: string;
  link: string;
  image: {
    url: string;
  }
  item: RSSItem[];
}

interface RSS {
  channel: RSSChannel[];
}

const prisma = new PrismaClient();
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
export async function fetchAndStoreRSS({ url, name, category }: { url: string, name: string, category: string }) {
  console.log("============================")
  console.log("fetching and storing rss", { url, name })

  if (!url) {
    console.error('No url provided', url);
    throw new Error('No url provided');
  }



  let feed
  try {
    feed = await parser.parseURL(url);
  } catch (error) {
    console.error("Error fetching RSS")
    // await prisma.$disconnect();
    return
  }

  try {

    const publisherData = {
      name: name || feed.title,
      rssUrl: url,
      publisherType: 'rss',
      contentType: 'article',
      category: category,
      categoryExternal: feed.category?.toLowerCase() || category,
      imageUrl: feed.image?.url,
    };

    const materials = []
    for (let item of feed.items) {
      // console.log({ item })

      let publishedAt = new Date();
      if (item.pubDate) {
        publishedAt = new Date(item.pubDate)
      } else if (item.isoDate) {
        publishedAt = new Date(item.isoDate)
      }

      const data = {
        title: item.title.trim(),
        type: 'article', // You can modify this based on your needs
        category,
        categoryExternal: item.categories && typeof item.categories[0] === 'string' ? item.categories[0].trim().toLowerCase() : category,
        url: item.link?.trim(),
        imageUrl: item.image?.trim(),
        publishedAt,
        publisher: {
          connectOrCreate: {
            where: { rssUrl: publisherData.rssUrl },
            create: publisherData,
          },
        },
      }

      console.log(data, { publisher: publisherData })

      try {
        const meterial = await prisma.material.upsert({
          where: { url: data.url },
          create: data,
          update: data
        });
        materials.push(meterial)
      } catch (err) {
        console.log("Error creating material", { data, publisherData })
        console.error("Error creating material", err)
      }
    }

    console.log("done")

    return { materials }
  } catch (error) {
    console.error(`Error fetching and storing RSS: ${url}`, error);
    throw error;
  } finally {
    console.log("disconnecting")
  }
}
