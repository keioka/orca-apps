import { NextApiRequest, NextApiResponse } from 'next';
import deepmerge from 'deepmerge'
import { getMaterials, createMaterial, getMaterialByUrl, upsertMaterial } from '@/models/material'
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
    const entryRaw = await getEntryRaw(entryId)
    const entry = await getEntry(entryId)
    const entryWithLocale = await getEntryWithLocale(entryId)

    const contentTypeId = entry.sys.contentType.sys.id
    const environmentId = entry.sys.environment.sys.id
    const version = entryRaw.sys.version

    const [p1Vocab, p2Vocab, p3Vocab, p4Vocab, p5Vocab] = await Promise.all([
      entry.fields.p1 ? pRetry(() => fetchVocab(entry.fields.p1), retryConfig) : null,
      entry.fields.p2 ? pRetry(() => fetchVocab(entry.fields.p2), retryConfig) : null,
      entry.fields.p3 ? pRetry(() => fetchVocab(entry.fields.p3), retryConfig) : null,
      entry.fields.p4 ? pRetry(() => fetchVocab(entry.fields.p4), retryConfig) : null,
      entry.fields.p5 ? pRetry(() => fetchVocab(entry.fields.p5), retryConfig) : null,
      entry.fields.p6 ? pRetry(() => fetchVocab(entry.fields.p6), retryConfig) : null,
    ])

    const p1AudioLink = entry.fields.p1 ? await polly({ text: removeCitations(entry.fields.p1), paragraphNumber: 1, slug: entry.fields.slug }) : null
    const p2AudioLink = entry.fields.p2 ? await polly({ text: removeCitations(entry.fields.p2), paragraphNumber: 2, slug: entry.fields.slug }) : null
    const p3AudioLink = entry.fields.p3 ? await polly({ text: removeCitations(entry.fields.p3), paragraphNumber: 3, slug: entry.fields.slug }) : null
    const p4AudioLink = entry.fields.p4 ? await polly({ text: removeCitations(entry.fields.p4), paragraphNumber: 4, slug: entry.fields.slug }) : null
    const p5AudioLink = entry.fields.p5 ? await polly({ text: removeCitations(entry.fields.p5), paragraphNumber: 5, slug: entry.fields.slug }) : null

    const [{ text: titleJa }, { text: p1Ja }, { text: p2Ja }, { text: p3Ja }, { text: p4Ja }, { text: p5Ja }] = await translate({ texts: [entry.fields.title, entry.fields.p1, entry.fields.p2, entry.fields.p3, entry.fields.p4, entry.fields.p5], targetLang: 'ja' })

    const fields = deepmerge(
      entryWithLocale.fields,
      {
        title: {
          "ja": titleJa
        },
        p1: {
          "ja": p1Ja,
        },
        p2: {
          "ja": p2Ja
        },
        p3: {
          "ja": p3Ja
        },
        p4: {
          "ja": p4Ja
        },
        p5: {
          "ja": p5Ja
        },
        // p6: {
        //   "ja": jaData.p6
        // }
      }
    )

    if (p1Vocab) {
      fields.p1Vocab = formatVocabData(p1Vocab)
    }
    if (p2Vocab) {
      fields.p2Vocab = formatVocabData(p2Vocab)
    }
    if (p3Vocab) {
      fields.p3Vocab = formatVocabData(p3Vocab)
    }
    if (p4Vocab) {
      fields.p4Vocab = formatVocabData(p4Vocab)
    }
    if (p5Vocab) {
      fields.p5Vocab = formatVocabData(p5Vocab)
    }

    if (p1AudioLink) {
      fields.p1AudioLink = p1AudioLink.filePath
    }
    if (p2AudioLink) {
      fields.p2AudioLink = p2AudioLink.filePath
    }
    if (p3AudioLink) {
      fields.p3AudioLink = p3AudioLink.filePath
    }
    if (p4AudioLink) {
      fields.p4AudioLink = p4AudioLink.filePath
    }
    if (p5AudioLink) {
      fields.p5AudioLink = p5AudioLink.filePath
    }


    delete fields.heroImage

    try {
      const result = await updateEntry({
        entryId,
        contentTypeId,
        environmentId,
        version,
        fields: fields
      })

      return res.status(200).json({
        fields,
        p1Vocab,
        p2Vocab,
        p3Vocab,
        p4Vocab,
        p5Vocab,
        p1AudioLink,
        p2AudioLink,
        p3AudioLink,
        p4AudioLink,
        p5AudioLink,
        titleJa,
        p1Ja,
        p2Ja,
        p3Ja,
        p4Ja,
        p5Ja
      });
    } catch (error) {
      console.error(error)
    }

  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}

function removeCitations(paragraph: string): string {
  // Regular expression to match citation patterns like [1], [1,2], (1), (1,2)
  const citationPattern = /\[\d+(,\d+)*\]|\(\d+(,\d+)*\)/g;

  // Replace the matched patterns with an empty string
  return paragraph.replace(citationPattern, '').trim();
}



