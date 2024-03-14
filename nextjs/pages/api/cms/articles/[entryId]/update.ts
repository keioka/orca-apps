import { NextApiRequest, NextApiResponse } from 'next';
import deepmerge from 'deepmerge'
import { getEntry, getEntryWithLocale, getEntryRaw } from '@/common/contentful'
import { fetchVocab } from '@/common/workServer/vocab'
import { polly } from '@/common/lambda/polly'
import { translate } from '@/utils/apis/deepL'
import pRetry, { AbortError } from 'p-retry';
import { v4 as uuidv4 } from 'uuid';

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

    if (!entry.fields.p1 || !entry.fields.p2 || !entry.fields.p3) {
      return res.status(400).json({ message: 'Paragraphs are not filled' });
    }

    const p1AudioLink = entry.fields.p1 ? await polly({ text: removeCitations(entry.fields.p1), paragraphNumber: 1, slug: entry.fields.slug }) : null
    const p2AudioLink = entry.fields.p2 ? await polly({ text: removeCitations(entry.fields.p2), paragraphNumber: 2, slug: entry.fields.slug }) : null
    const p3AudioLink = entry.fields.p3 ? await polly({ text: removeCitations(entry.fields.p3), paragraphNumber: 3, slug: entry.fields.slug }) : null
    const p4AudioLink = entry.fields.p4 ? await polly({ text: removeCitations(entry.fields.p4), paragraphNumber: 4, slug: entry.fields.slug }) : null
    const p5AudioLink = entry.fields.p5 ? await polly({ text: removeCitations(entry.fields.p5), paragraphNumber: 5, slug: entry.fields.slug }) : null

    let titleJa, p1Ja, p2Ja, p3Ja, p4Ja, p5Ja
    if (process.env.NODE_ENV !== 'development') {
      [{ text: titleJa }, { text: p1Ja }, { text: p2Ja }, { text: p3Ja }, { text: p4Ja }, { text: p5Ja }] = [{ text: null }, { text: null }, { text: null }, { text: null }, { text: null }, { text: null }]
    } else {

      const texts = [entry.fields.title, entry.fields.p1, entry.fields.p2, entry.fields.p3]
      if (entry.fields.p4) {
        texts.push(entry.fields.p4)
      }
      if (entry.fields.p5) {
        texts.push(entry.fields.p5)
      }
      // [{ text: titleJa }, { text: p1Ja }, { text: p2Ja }, { text: p3Ja }, { text: p4Ja }, { text: p5Ja }]
      const result = await translate({ texts: texts, targetLang: 'ja' })
      titleJa = result[0].text
      p1Ja = result[1].text
      p2Ja = result[2].text
      p3Ja = result[3].text
      p4Ja = result[4] ? result[4].text : null
      p5Ja = result[5] ? result[5].text : null
    }
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
        }
      }
    )

    const uniqueVocabMemo = {}
    const filteredVocab = {}
    if (p1Vocab) {
      filteredVocab.p1Vocab = p1Vocab
      p1Vocab.forEach(vocab => {
        if (!uniqueVocabMemo[vocab.word]) {
          uniqueVocabMemo[vocab.word] = true
        }
      })
    }
    if (p2Vocab) {
      filteredVocab.p2Vocab = p2Vocab.filter(vocab => !uniqueVocabMemo[vocab.word])
      p2Vocab.forEach(vocab => {
        if (!uniqueVocabMemo[vocab.word]) {
          uniqueVocabMemo[vocab.word] = true
        }
      })
    }
    if (p3Vocab) {
      filteredVocab.p3Vocab = p3Vocab.filter(vocab => !uniqueVocabMemo[vocab.word])
      p3Vocab.forEach(vocab => {
        if (!uniqueVocabMemo[vocab.word]) {
          uniqueVocabMemo[vocab.word] = true
        }
      })
    }
    if (p4Vocab) {
      filteredVocab.p4Vocab = p4Vocab.filter(vocab => !uniqueVocabMemo[vocab.word])
      p4Vocab.forEach(vocab => {
        if (!uniqueVocabMemo[vocab.word]) {
          uniqueVocabMemo[vocab.word] = true
        }
      })
    }
    if (p5Vocab) {
      filteredVocab.p5Vocab = p5Vocab.filter(vocab => !uniqueVocabMemo[vocab.word])
      p5Vocab.forEach(vocab => {
        if (!uniqueVocabMemo[vocab.word]) {
          uniqueVocabMemo[vocab.word] = true
        }
      })
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

    try {
      // const result = await updateEntry({
      //   entryId,
      //   contentTypeId,
      //   environmentId,
      //   version,
      //   fields: fields
      // })
      return res.status(200).json({
        p1Vocab: addUUIDToVocab(filteredVocab.p1Vocab),
        p2Vocab: addUUIDToVocab(filteredVocab.p2Vocab),
        p3Vocab: addUUIDToVocab(filteredVocab.p3Vocab),
        p4Vocab: addUUIDToVocab(filteredVocab.p4Vocab),
        p5Vocab: addUUIDToVocab(filteredVocab.p5Vocab),
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
      return res.status(500).json({ message: 'Failed to update entry' });
    }

  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}

function removeCitations(paragraph: string): string {
  // Regular expression to match citation patterns like [1], [1,2], (1), (1,2)
  const citationPattern = /\[\d+(,\d+)*\]|\(\d+(,\d+)*\)|\【\d+(,\d+)*\】/g;

  // Replace the matched patterns with an empty string
  return paragraph.replace(citationPattern, '').trim();
}


function addUUIDToVocab(vocabs) {
  if (!vocabs) {
    return []
  }
  return vocabs.map(vocab => {
    vocab.id = uuidv4()
    return vocab
  })
}


