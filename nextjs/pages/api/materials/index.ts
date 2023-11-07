import { NextApiRequest, NextApiResponse } from 'next';
import { getMaterials, createMaterial, getMaterialByUrl, upsertMaterial } from '@/models/material'
import { getPublisherById } from '@/models/publisher';
import { validateTokenWithoutError } from '@/firebase';
import { fetchMetadata } from '@/common/fetchMetadata';
import Parser from 'rss-parser';
import keywordExtractor from 'keyword-extractor';
import { fetchAndParseWebsite } from '@/utils/webParser';

type CustomFeed = { item: string };
type CustomItem = { image: string };

const parser: Parser<CustomFeed, CustomItem> = new Parser({
  customFields: {
    item: ['image'],
  }
});


async function parseAndCreateMaterial({ publisherId, category }: { publisherId: string, category: string }) {
  const publisher = await getPublisherById(publisherId)
  const url = publisher.rssUrl;

  const feed = await parser.parseURL(url);
  for (let item of feed.items) {
    // console.log({ item })

    let publishedAt = new Date();
    if (item.pubDate) {
      publishedAt = new Date(item.pubDate)
    } else if (item.isoDate) {
      publishedAt = new Date(item.isoDate)
    }


    const title = item.title.trim()
    const url = item.link?.trim()

    const sitedata = await fetchAndParseWebsite(url)

    const data = {
      title,
      type: 'article', // You can modify this based on your needs
      category,
      categoryExternal: item.categories && typeof item.categories[0] === 'string' ? item.categories[0].trim().toLowerCase() : category,
      url,
      imageUrl: item.image && typeof item.image === 'string' ? item.image.trim() : sitedata?.imageUrl,
      publishedAt,
      publisher: {
        connect: {
          id: publisherId
        },
      },
    }



    try {
      await upsertMaterial(data)
    } catch (err) {
      console.log("Error creating material", { data })
      console.error("Error creating material", err)
    }
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { category, date, offset, limit, publisherIds } = req.query;
    if (date && typeof date !== 'string') {
      return res.status(400).json({ message: 'Date must be a string' });
    }

    // if (publisherIds && typeof publisherIds !== 'string') {
    //   for (const publisherId of publisherIds) {
    //     await parseAndCreateMaterial({ publisherId, category: category as string })
    //     console.log("done")
    //   }
    // } else if (publisherIds && typeof publisherIds === 'string') {
    //   await parseAndCreateMaterial({ publisherId: publisherIds, category: category as string })
    //   console.log("done")
    // }

    try {
      const material = await getMaterials({
        category: category as string,
        date: date && new Date(date as string),
        offset,
        limit,
        publisherIds
      });
      if (!material) {
        return res.status(404).json({ message: 'Material not found' });
      }
      return res.status(200).json(material);
    } catch (error) {
      console.error(error)
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  if (req.method === 'POST') {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
      const cleanURL = new URL(url)
      const material = await getMaterialByUrl(cleanURL.href as string)
      if (material) {
        return res.status(200).json(material);
      }

      const metadata = await fetchMetadata(url as string)

      const materialData = {
        url: url as string,
        title: metadata.title,
        imageUrl: metadata.image,
        type: "article",
        publishedAt: metadata.publishedAt,
        externalId: metadata.externalId,
        category: metadata.category,
        publisher: metadata.publisher,
      }

      const createdMaterial = await createMaterial(materialData);
      return res.status(201).json(createdMaterial);
    } catch (error) {
      console.error(error)
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  return res.status(405).json({ message: 'Method not allowed' });
}