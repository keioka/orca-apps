import { NextApiRequest, NextApiResponse } from 'next';
import { checkPublishersCrawledStatus } from '@/models/publisher';
import { createArticlesByPublisherId } from '@/common/createArticlesByPublisherId';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method Not Allowed' });
    return;
  }

  const { publisherIds, size = 50 } = req.body

  try {
    if (publisherIds) {
      const result = await Promise.all(publisherIds.map(async (publisherId: string) => {
        const { materials } = await createArticlesByPublisherId({ publisherId })
        return materials
      }))
      res.status(200).json({ message: `Material updated successfully`, result });
      return;
    }

    const publishers = await checkPublishersCrawledStatus()
    const publishersToCrawl = publishers.slice(0, size)

    const result = await Promise.all(publishersToCrawl.map((publisher) => {
      return createArticlesByPublisherId({ publisherId: publisher.id })
    }))

    res.status(200).json({ message: `Material updated successfully`, result });
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Internal server error' });
  }
}
