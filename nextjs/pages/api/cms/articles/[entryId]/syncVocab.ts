import { NextApiRequest, NextApiResponse } from 'next';
import deepmerge from 'deepmerge'
import { getMaterialByExternalId, createVocabs, getMaterialByUrl, upsertMaterial } from '@/models/material'
import { getEntry, getEntryWithLocale, updateEntry, getEntryRaw } from '@/common/contentful'
import { fetchVocab } from '@/common/workServer/vocab'
import { polly } from '@/common/lambda/polly'
import { translate } from '@/utils/apis/deepL'
import pRetry, { AbortError } from 'p-retry';
function formatVocabData(data) {
  return { ja: data }
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
    const material = await getMaterialByExternalId(entryId)

    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    const p1Vocab = Array.isArray(entry.fields.p1Vocab) ? entry.fields.p1Vocab : []
    const p2Vocab = Array.isArray(entry.fields.p2Vocab) ? entry.fields.p2Vocab : []
    const p3Vocab = Array.isArray(entry.fields.p3Vocab) ? entry.fields.p3Vocab : []
    const p4Vocab = Array.isArray(entry.fields.p4Vocab) ? entry.fields.p4Vocab : []
    const p5Vocab = Array.isArray(entry.fields.p5Vocab) ? entry.fields.p5Vocab : []

    const vocabs = [
      ...p1Vocab,
      ...p2Vocab,
      ...p3Vocab,
      ...p4Vocab,
      ...p5Vocab,
    ]

    if (!vocabs.length) {
      return res.status(404).json({ message: 'No vocab found' })
    }

    const vocabParams = vocabs.map(vocab => {
      return {
        ...vocab,
        translation: vocab.meaningInJapanese,
        langCode: 'ja',
        materialId: material.id
      }
    })

    console.log({ vocabParams, entry })

    const addedVocabs = await createVocabs({
      materialId: material.id,
      vocabParams
    })

    return res.status(200).json({ vocabs: addedVocabs })
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}