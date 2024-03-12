import deepmerge from 'deepmerge'
import { getMaterialByExternalId, createVocabs, getMaterialByUrl, upsertMaterial } from '@/models/material'
import { getEntry, getEntryWithLocale, updateEntry, getEntryRaw } from '@/common/contentful'
import { fetchVocab } from '@/common/workServer/vocab'
import { polly } from '@/common/lambda/polly'
import { translate } from '@/utils/apis/deepL'
import pRetry, { AbortError } from 'p-retry';
import * as Material from '@/models/material'
import * as Publisher from '@/models/publisher'

function formatVocabData(data) {
  return { ja: data }
}

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

export async function syncArticleByExternalId(entryId: string) {
  const entry = await getEntry(entryId)

  let publisher = await Publisher.getPublisherById(process.env.ORCA_PUBLISHER_ID)

  console.log("<<<<<<<<<<<<< publishe >>>>>>>>>>>>>>>", publisher)
  if (!publisher) {
    const publishers = await Publisher.fetchAllPublishers()
    publisher = publishers.find((publisher) => publisher.name === "Orca News")
    if (!publisher) {
      console.error({ publisher })
      throw new Error("Orca News not found")
    }
  }

  const result = await formatContentfulEntry(entry)
  const material = await Material.getMaterialByExternalId(result.id)

  let newArticle = null
  let addedVocabs = null
  let isNew = false

  if (material) {
    newArticle = await Material.updateMaterial({
      externalId: result.id,
      url: result.url + "?mode=embed",
      title: result.title || "general",
      category: convertCategory[result.category],
      categoryExternal: result.category,
      imageUrl: result.imageUrl,
      type: "article",
      slug: result.slug,
      publisher: {
        connect: {
          id: process.env.ORCA_PUBLISHER_ID
        }
      }
    })
  } else {
    isNew = true
    newArticle = await Material.createMaterial({
      externalId: result.id,
      url: result.url + "?mode=embed",
      title: result.title || "general",
      category: convertCategory[result.category],
      categoryExternal: result.category,
      imageUrl: result.imageUrl,
      publishedAt: result.publishedAt || new Date(),
      type: "article",
      slug: result.slug,
      publisher: {
        id: process.env.ORCA_PUBLISHER_ID,
        name: publisher.name,
        domain: publisher.domain,
        contentType: publisher.contentType,
        publisherType: publisher.publisherType,
      }
    })
    const p1Vocab = Array.isArray(entry.fields.p1Vocab) ? entry.fields.p1Vocab : []
    const p2Vocab = Array.isArray(entry.fields.p2Vocab) ? entry.fields.p2Vocab : []
    const p3Vocab = Array.isArray(entry.fields.p3Vocab) ? entry.fields.p3Vocab : []
    const p4Vocab = Array.isArray(entry.fields.p4Vocab) ? entry.fields.p4Vocab : []
    const p5Vocab = Array.isArray(entry.fields.p5Vocab) ? entry.fields.p5Vocab : []

    const vocabs = [
      ...p1Vocab.map(vocab => ({ ...vocab, paragraphNumber: 1 })),
      ...p2Vocab.map(vocab => ({ ...vocab, paragraphNumber: 2 })),
      ...p3Vocab.map(vocab => ({ ...vocab, paragraphNumber: 3 })),
      ...p4Vocab.map(vocab => ({ ...vocab, paragraphNumber: 4 })),
      ...p5Vocab.map(vocab => ({ ...vocab, paragraphNumber: 5 }))
    ]

    if (!vocabs.length) {
      return res.status(404).json({ message: 'No vocab found' })
    }

    const vocabParams = vocabs.map(vocab => {
      return {
        ...vocab,
        translation: vocab.meaningInJapanese,
        langCode: 'ja',
        materialId: newArticle.id
      }
    })

    console.log({ vocabParams, entry })

    addedVocabs = await createVocabs({
      materialId: newArticle.id,
      vocabParams
    })
  }

  return { newArticle, addedVocabs, isNew, content: result }
}
