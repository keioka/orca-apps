import type { NextApiRequest, NextApiResponse } from 'next';
import Parser from 'rss-parser'

const YOUTUBE_API_KEY = 'YOUR_API_KEY_HERE';
const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3/search';

// Interface to type the expected query parameters
interface QueryParams {
  keyword: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    if (req.method !== 'GET') {
      // Return 405 - Method Not Allowed if it's not a GET request
      return res.status(405).end();
    }

    const { keyword } = req.query as unknown as QueryParams;

    if (!keyword) {
      return res.status(400).json({ error: 'Keyword query parameter is required' });
    }

    try {
      const response = await fetch(`${YOUTUBE_API_BASE_URL}?part=snippet&maxResults=25&q=${encodeURIComponent(keyword)}&key=${YOUTUBE_API_KEY}`);
      const data = await response.json();

      return res.status(200).json(data);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'An error occurred while fetching data from YouTube API' });
    }

  } catch (error: any) {
    console.log('error', error);
    return res.status(500).json({ error: error.message || 'Something went wrong' });
  }
}
