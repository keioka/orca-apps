import { NextApiRequest, NextApiResponse } from 'next';
import { updatePublisherInfo } from '@/models/publisher';

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
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { publisherId } = req.query;
  const data = req.body as PublisherUpdateInput;

  try {
    const updatedPublisher = await updatePublisherInfo(publisherId as string, data);
    res.status(200).json(updatedPublisher);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to update publisher information' });
  }
}
