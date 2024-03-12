import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchAndParseWebsite } from '@/utils/webParser';
const news = require('gnews');
import { translate } from '@/utils/apis/deepL'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { geo = 'Japan' } = req.query;
  const articles = await news.geo(geo, { n: 20 });
  const translation = await translate({ text, lang })

  for (let article of articles) {
    console.log(article.pubDate + ' | ' + article.title);
  }

  return res.status(200).json(articles);
}
