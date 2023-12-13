import { client } from '../utils/apis/contentful'
import * as Material from '../models/material'

interface SysLink {
  type: string;
  linkType: string;
  id: string;
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
  const { file } = heroImage.fields
  const { url: imageUrl } = file

  return {
    title,
    url: process.env.ROOT_URL + "/articles/" + slug,
    slug,
    category: category || "News",
    publishedAt: new Date(publishedDate),
    imageUrl: "https:" + imageUrl,
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

  return Promise.all(articles.map(async (article) => {
    const result = await formatContentfulEntry(article)
    try {
      return await Material.createMaterial({
        url: result.url,
        title: result.title,
        category: result.category,
        imageUrl: result.imageUrl,
        type: "article",
        publisher: {
          id: "c6b7841e-12c8-4cf1-a5d3-c61724dc982c"
        }
      })
    } catch (error) {
      console.error(error)
      return null
    }
  }))
}