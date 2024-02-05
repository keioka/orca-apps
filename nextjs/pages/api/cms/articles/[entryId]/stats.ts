import { NextApiRequest, NextApiResponse } from 'next';
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
    p1VocabCount: fields.p1Vocab.length,
    p2VocabCount: fields.p2Vocab.length,
    p3VocabCount: fields.p3Vocab.length,
    p4VocabCount: fields.p4Vocab.length,
    p5VocabCount: fields.p5Vocab.length,
    p1AudioLink: fields.p1AudioLink,
    p2AudioLink: fields.p2AudioLink,
    p3AudioLink: fields.p3AudioLink,
    p4AudioLink: fields.p4AudioLink,
    p5AudioLink: fields.p5AudioLink,
  }
}

export const maxDuration = 300; // This function can run for a maximum of 5 seconds

const retryConfig = {
  retries: 5,
  onFailedAttempt: error => {
    console.warn(`Attempt ${error.attemptNumber} failed. There are ${error.retriesLeft} retries left.`);
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const entryId = req.query.entryId
    const entry = await getEntry(entryId)

    const result = await formatContentfulEntry(entry)
    const material = await Material.getMaterialByExternalId(result.id)
    const vocabs = await Material.getVocabsByMaterialId(material.id)

    const mappedVocabs = vocabs.map(vocab => {
      return {
        id: vocab.id,
        word: vocab.word,
        pos: vocab.pos,
        // sentence: vocab.sentence,
        // meaning: vocab.meaning,
        meaningInJapanese: vocab.translation.find(t => t.languageId === 9).content,
        // example: vocab.example,
      }
    })

    return res.status(200).json({ entry: result, material, mappedVocabs })
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}