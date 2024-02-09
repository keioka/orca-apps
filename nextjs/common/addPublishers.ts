import Parser from 'rss-parser';
import * as PublisherModel from '../models/publisher';

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

// const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface Publisher { url: string, name: string, category?: string, isRecommended?: boolean, domain?: string }

export async function addPublishers(publishers: Publisher[], category?: string) {
  const publishersData = await Promise.all(publishers.map(async (publisher) => {
    try {

      const publisherData = {
        name: publisher.name,
        rssUrl: publisher.url,
        publisherType: 'rss',
        domain: publisher.domain ? publisher.domain : null,
        contentType: 'article',
        category: publisher.category?.toLowerCase() || category,
        isRecommended: publisher.isRecommended
      };

      return publisherData
    } catch (error: any) {
      console.error(`${error.code}-${error.message}`, publisher.url)
      return null
    }
  }))

  const validData = publishersData.filter((publisher) => publisher)
  const result = await PublisherModel.createPublishers(validData)
  return result
}