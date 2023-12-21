import { client } from '../utils/apis/contentful'
import * as Material from '../models/material'
import * as Publisher from '../models/publisher'

export const convertCategory = {
  "ai": "tech",
  "business": "business",
  "eu_stock": "economy",
  "fintech": "business",
  "israel-hamas": "world_news",
  "jp_economy": "economy",
  "jp_news": "world_news",
  "jp_stock": "economy",
  "marketing": "business",
  "metaverse": "tech",
  "russia-ukraine": "world_news",
  "science": "science",
  "sdgs": "world_news",
  "startup": "business",
  "tech": "tech",
  "us_stock": "economy",
  "web3": "tech",
  "world_economy": "economy",
  "world_news": "world_news",
  "general": "world_news",
}


interface Sys {
  space?: {
    sys: SysLink;
  };
  id: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  environment?: {
    sys: SysLink;
  };
  revision?: number;
  contentType?: {
    sys: SysLink;
  };
  locale: string;
}

interface Metadata {
  tags: any[];
}

interface ImageDetails {
  size: number;
  image: {
    width: number;
    height: number;
  };
}

interface File {
  url: string;
  details: ImageDetails;
  fileName: string;
  contentType: string;
}

interface ContentFields {
  title?: string;
  description?: string;
  file?: File;
}

interface ContentNode {
  data: any;
  marks?: any[];
  value?: string;
  nodeType: string;
  content?: ContentNode[];
}

interface Content {
  data: any;
  content: ContentNode[];
  nodeType: string;
}

interface Fields {
  title: string;
  publishedDate: string;
  content: Content;
  slug: string;
  heroImage: {
    metadata: Metadata;
    sys: Sys;
    fields: ContentFields;
  };
  wordCount: number;
  [key: string]: any; // For p1, p2, p3, etc., or other dynamic keys
}

interface Entry {
  metadata: Metadata;
  sys: Sys;
  fields: Fields;
}

function formatContentfulEntry(article: Entry): {
  url: string;
  title: string;
  slug: string;
  category: string;
  publishedAt: Date;
  imageUrl: string;
} {
  const { fields } = article
  const { title, slug, publishedDate, heroImage, category } = fields
  const file = heroImage && heroImage.fields ? heroImage.fields.file : null
  const imageUrl = file ? file.url : null

  return {
    title,
    url: process.env.ROOT_URL + "/articles/" + slug,
    slug,
    category: category || "general",
    publishedAt: publishedDate ? new Date(publishedDate) : new Date(),
    imageUrl: imageUrl ? "https:" + imageUrl : null,
  }
}

export async function syncContentful() {

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

  let publisher = await Publisher.getPublisherById(process.env.ORCA_PUBLISHER_ID)

  if (!publisher) {
    const publishers = await Publisher.fetchAllPublishers()
    const publisher = publishers.find((publisher) => publisher.name === "Orca News")
    if (!publisher) {
      throw new Error("Orca News not found")
    }
  }

  const newArticles = await Promise.all(
    articles.map(async (article) => {

      try {
        const result = await formatContentfulEntry(article)

        const newArticle = await Material.upsertMaterial({
          url: result.url + "?mode=embed",
          title: result.title || "general",
          category: convertCategory[result.category],
          categoryExternal: result.category,
          imageUrl: result.imageUrl,
          publishedAt: result.publishedAt,
          type: "article",
          publisher: {
            connectOrCreate: {
              where: { id: process.env.ORCA_PUBLISHER_ID },
              create: publisher
            }
          },
        })

        return newArticle
      } catch (error) {
        console.log("===== Error ======")
        console.warn({ publisher })
        console.error(error)
        return null
      }
    }))
  console.log({ newArticles })
  return newArticles
}