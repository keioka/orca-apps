import { NextApiRequest, NextApiResponse } from 'next';
import { getPublisherById } from '@/models/publisher';

type PublisherUpdateInput = {
  contentType?: string;
  publisherType?: string;
  rssUrl?: string;
  domain?: string;
  category?: string;
  categoryExternal?: string;
  isActive?: boolean;
  isRecommended?: boolean;
  imageUrl?: string;
  description?: string;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { publisherId } = req.query;
  const data = req.body as PublisherUpdateInput;

  try {
    const publisher = await getPublisherById(publisherId as string, data);
    return res.status(200).json(publisher);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to update publisher information' });
  }
}
