import type { NextApiRequest, NextApiResponse } from 'next';
import urlMetadata from 'url-metadata'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { url } = req.query;

  //only accept post requests
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!url) {
    return res.status(400).json({ message: 'No url in the request' });
  }

  try {
    const data = await urlMetadata(url)

    const sitedata = {
      title: data.title || data['og:title'],
      description: data.description || data['og:description'],
      image: data.image || data['og:image'],
      url: data.url || data['og:url'],
      name: data['og:site_name'],
      locale: data['og:locale'],
    }
    res.status(200).json(sitedata);
  } catch (error: any) {
    console.log('error', error);
    res.status(500).json({ error: error.message || 'Something went wrong' });
  }
}
