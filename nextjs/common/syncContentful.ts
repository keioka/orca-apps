import { client } from '../utils/apis/contentful'
import * as Material from '../models/material'
import * as Publisher from '../models/publisher'
import { getMaterialByExternalId, createVocabs } from '@/models/material'

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
  id: string;
  url: string;
  title: string;
  slug: string;
  category: string;
  publishedAt: Date;
  imageUrl: string;
} {
  const { fields, sys } = article
  const { id, title, slug, publishedDate, heroImage, category } = fields
  const file = heroImage && heroImage.fields ? heroImage.fields.file : null
  const imageUrl = file ? file.url : null

  return {
    id: sys.id,
    title,
    url: process.env.ROOT_URL + "/articles/" + slug,
    slug,
    category: category || "general",
    publishedAt: publishedDate ? new Date(publishedDate) : new Date(),
    imageUrl: imageUrl ? "https:" + imageUrl : null,
    p1Vocab: fields.p1Vocab,
    p2Vocab: fields.p2Vocab,
    p3Vocab: fields.p3Vocab,
    p4Vocab: fields.p4Vocab,
    p5Vocab: fields.p5Vocab,
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
    publisher = publishers.find((publisher) => publisher.name === "Orca News")
    if (!publisher) {
      console.error({ publisher })
      throw new Error("Orca News not found")
    }
  }

  const newArticles = await Promise.all(
    articles.map(async (article) => {

      try {
        const result = await formatContentfulEntry(article)

        const material = await Material.getMaterialByExternalId(result.id)
        let newArticle = null

        console.log({ material })
        if (material) {
          newArticle = await Material.updateMaterial({
            externalId: result.id,
            url: result.url + "?mode=embed",
            title: result.title || "general",
            category: convertCategory[result.category],
            categoryExternal: result.category,
            imageUrl: result.imageUrl,
            publishedAt: result.publishedAt,
            type: "article",
            publisher: {
              connect: {
                id: process.env.ORCA_PUBLISHER_ID
              }
            }
          })
        } else {
          newArticle = await Material.createMaterial({
            externalId: result.id,
            url: result.url + "?mode=embed",
            title: result.title || "general",
            category: convertCategory[result.category],
            categoryExternal: result.category,
            imageUrl: result.imageUrl,
            publishedAt: result.publishedAt,
            type: "article",
            publisher: {
              id: process.env.ORCA_PUBLISHER_ID
            }
          })
        }

        /** ADD VOCABS */
        const p1Vocab = Array.isArray(result.p1Vocab) ? result.p1Vocab : []
        const p2Vocab = Array.isArray(result.p2Vocab) ? result.p2Vocab : []
        const p3Vocab = Array.isArray(result.p3Vocab) ? result.p3Vocab : []
        const p4Vocab = Array.isArray(result.p4Vocab) ? result.p4Vocab : []
        const p5Vocab = Array.isArray(result.p5Vocab) ? result.p5Vocab : []

        const vocabs = [
          ...p1Vocab,
          ...p2Vocab,
          ...p3Vocab,
          ...p4Vocab,
          ...p5Vocab,
        ]

        const vocabParams = vocabs.map(vocab => {
          return {
            ...vocab,
            translation: vocab.meaningInJapanese,
            langCode: 'ja',
            materialId: newArticle.id
          }
        })

        console.log({ vocabParams })

        await createVocabs({
          materialId: newArticle.id,
          vocabParams
        })

        return newArticle
      } catch (error) {
        console.log("===== Error ======")
        console.warn({ publisher })
        console.error(error)
        return { error }
      }
    }))
  console.log({ newArticles })
  return newArticles
}