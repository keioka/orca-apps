import type { NextApiRequest, NextApiResponse } from 'next';
import { fetchAndParseWebsite } from '@/utils/webParser';
const news = require('gnews');
import { translate } from '@/utils/apis/deepL'
const jwt = require('jsonwebtoken')
interface Query {
  query: string;
  label: string;
  type: string;
}

// {
//   query: 'japan wage',
//   label: '賃上げ2024',
//   type: 'search'
// },
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  if (!req.body.queries) {
    return res.status(400).json({ message: 'Bad Request' });
  }

  try {
    const { queries } = req.body;
    const result = await Promise.all(queries.map(async (queryInfo) => {
      const articles = await news.search(queryInfo.query);

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

      return {
        ...queryInfo,
        articles: articleWithLocale
      };
    }))

    const token = jwt.sign({ data: result }, 'secret')

    return res.status(200).json({
      queryResult: result,
      token
    });

  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Something went wrong' });
  }
}
