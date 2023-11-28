import { FastifyRequest, FastifyReply } from 'fastify';
import { createArticle } from '../helpers/openai';
// import { getNews, formatResponse as formatResponseDataIo } from '../helpers/newsdataio';
import { getNewsFromAPI, formatResponse } from '../helpers/newsapi';

interface NewsData {
  title: string;
  url: string;
  publishedAt: string;
}

export async function generateArticle(req: FastifyRequest) {
  const { query } = req.body;
  try {
    // const news: NewsData[] = await formatResponseDataIo(await getNews(query))
    const news: NewsData[] = await formatResponse(await getNewsFromAPI(query))
    console.log({
      news
    })
    const urls = news.map((n) => n.url).slice(0, 10);
    const result = await createArticle({ urls });
    console.log({
      result
    })
    return {
      title: result.title,
      content: result.content,
      urls
    }
  } catch (error) {
    console.error(error);
  }
}