// import axios from 'axios';
// import { parseString } from 'xml2js';
import { PrismaClient } from '@prisma/client';
import Parser from 'rss-parser';

type CustomFeed = { foo: string };
type CustomItem = { bar: number };

const parser: Parser<CustomFeed, CustomItem> = new Parser({
  customFields: {
    item: ['image'],
  }
});

const prisma = new PrismaClient();

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

export async function fetchAndStoreRSS() {
  try {

    const feed = await parser.parseURL('https://www.worldhistory.org/rss2');

    console.log(feed);

    const publisherData = {
      name: feed.title,
      url: feed.link,
      type: 'Article',
      imageUrl: feed.image.url,
      externalId: 'worldhistory', // You can change this to a unique identifier for the publisher
    };

    console.log({ publisherData })

    for (const item of feed.items) {
      await prisma.material.create({
        data: {
          title: item.title,
          type: 'Article', // You can modify this based on your needs
          category: item.category ? item.category[0] : '',
          url: item.link,
          imageUrl: item.image,
          publishedAt: new Date(item.pubDate),
          externalId: item.guid,
          publisher: {
            connectOrCreate: {
              where: { externalId: publisherData.externalId },
              create: publisherData,
            },
          },
        },
      });
    }
  } catch (error) {
    console.error('Error fetching and storing RSS:', error);
  } finally {
    await prisma.$disconnect();
  }
}
