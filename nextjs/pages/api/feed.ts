import { NextApiRequest, NextApiResponse } from 'next'
import { client } from '../../utils/apis/contentful'
import { Feed } from "feed";
import { syncContentful } from '../../common/syncContentful';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {

  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  if (req.method === 'POST') {
    try {
      const result = await syncContentful()
      return res.status(201).json({ result });
    } catch (error) {
      console.error(error)
      return res.status(500).json({ message: 'Internal server error' });
    }
  }

  if (req.method === 'GET') {
    const result = await client.getEntries({
      content_type: "newsArticle",
      limit: 200,
    })

    const articles = result.items

    if (!articles) {
      return {
        notFound: true,
      }
    }

    try {
      const feed = new Feed({
        title: "Orca AI",
        language: "en", // optional, used only in RSS 2.0, possible values: http://www.w3.org/TR/REC-html40/struct/dirlang.html#langcodes
        description: "Orca AI",
      });

      articles.forEach(article => {
        feed.addItem({
          title: article.fields.title,
          link: process.env.ROOT_URL + "/articles/" + article.fields.slug,
          date: new Date(article.fields.publishedDate),
          image: "https:" + article.fields.heroImage.fields.file.url,
        });
      });

      return res
        .setHeader('Content-Type', 'text/xml')
        .setHeader(
          'Cache-Control',
          'public, s-maxage=10, stale-while-revalidate=59'
        )
        .status(200)
        .send(feed.rss2())
    } catch (error) {
      console.error(error)
      return res.status(500).json({ message: error.message });
    }
  }
}
