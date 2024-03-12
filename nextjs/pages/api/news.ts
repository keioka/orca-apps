import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchAndParseWebsite } from '@/utils/webParser';
const news = require('gnews');
import { translate } from '@/utils/apis/deepL'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    const { keyword } = req.query;
    const articles = await news.search(keyword);

    for (let article of articles) {
      console.log(article.pubDate + ' | ' + article.title);
    }

    const translation = await translate({ texts: articles.map((article) => article.title), targetLang: 'ja' })

    const articleWithLocale = articles.map((article, index) => {
      return {
        ...article,
        titleLocale: translation[index]
      }
    })

    return res.status(200).json(articleWithLocale);
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Something went wrong' });
  }
}
