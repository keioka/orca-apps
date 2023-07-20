import type { NextApiRequest, NextApiResponse } from 'next';
import Parser from 'rss-parser'

class CNN {
  static getTopNews(): Promise<Article[]> {
    return new Promise((resolve, reject) => {
      const parser = new Parser();
      parser.parseURL('http://rss.cnn.com/rss/edition.rss', (err, feed) => {
        if (err) {
          reject(err);
        } else {
          const articles: Article[] = feed.items.map((item) => {
            try {
              return this.convertToArticle(item);
            } catch (err) {
              reject(err);
            }
          });
          resolve(articles);
        }
      });
    })
  }

  static getTech(): Promise<Article[]> {
    return new Promise((resolve, reject) => {
      const parser = new Parser();
      parser.parseURL('http://rss.cnn.com/rss/edition_technology.rss', (err, feed) => {
        if (err) {
          reject(err);
        } else {
          const articles: Article[] = feed.items.map((item) => {
            try {
              return this.convertToArticle(item);
            } catch (err) {
              reject(err);
            }
          });
          resolve(articles);
        }
      });
    })
  }

  private static convertToArticle(data: any): Article {
    if (!data) {
      console.error("Invalid data");
    }

    if (!data.title) {
      console.error("Invalid title");
    }

    if (!data.content) {
      console.error(`Invalid content - title: ${data.title}`);
    }

    const article: Article = {
      id: 0, // You can assign an appropriate ID here
      title: data.title,
      content: data.content,
      summary: [], // Initialize with empty arrays for summary and vocabulary
      vocabulary: [],
      url: data.link,
      source: {
        id: 0, // You can assign an appropriate ID here
        name: "CNN" // Assuming the source is CNN for this example
      },
      createdAt: new Date(data.isoDate)
    };

    return article;
  }
}


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  try {
    let parser = new Parser();

    const cnn = await CNN.getTopNews()
    const tech = await CNN.getTech()

    const response = [
      ...tech,
      ...cnn,
    ]
    res.status(200).json(response);
  } catch (error: any) {
    console.log('error', error);
    res.status(500).json({ error: error.message || 'Something went wrong' });
  }
}
