import { NextApiRequest, NextApiResponse } from 'next';
import { getVocabsFromText } from 'utils/openai';
import { getMaterialById, createVocabs } from '@/models/material';
import { parseWebText } from '@/utils/webParser';
import { capitalize } from 'lodash';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { url, materialId, transLangCode = 'ja' } = req.body;

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  if (!url && !materialId) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {

    let text
    if (url) {
      text = await parseWebText(url)
    } else if (materialId) {
      const material = await getMaterialById(materialId)
      if (!material) {
        return res.status(404).json({ message: 'Material not found' });
      }
      text = await parseWebText(material.url)
    }

    if (!text) {
      console.error("Missing text");
      return res.status(500).json({ message: 'Missing text' });
    }

    const splitContent = splitTextBySentenceWithWordCount(text.replace(/\s+/g, ' ').trim(), 125)

    const transLangCodeCap = capitalize(transLangCode)

    splitContent.forEach(async (content) => {
      const { vocabs } = await getVocabsFromText({
        text: content.replace(/\s+/g, ' ').trim(),
        transLangCode: transLangCodeCap
      })

      const mappedVocabs = vocabs.map((vocab) => {
        return {
          ...vocab,
          translation: vocab[`transMeaning${transLangCodeCap}ByContext`],
          langCode: transLangCode
        }
      })

      try {
        await createVocabs({
          vocabParams: mappedVocabs,
          materialId
        })
      } catch (error) {
        console.error(error);
      }

      return mappedVocabs
    })

    return res.status(200).json({ status: "IN_PROGRESS" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
}

function splitTextBySentenceWithWordCount(text: string, count: number): string[] {
  const regex = /([.?!])\s*/; // Regex to split by delimiters and capture them
  const sentences = text.split(regex);
  const splitSentences: string[] = [];
  let currentContent = '';
  let wordCount = 0;

  for (let i = 0; i < sentences.length; i += 2) { // Increment by 2 to skip delimiters
    const sentence = sentences[i] + (sentences[i + 1] || ''); // Combine sentence with its delimiter
    const currentSentenceWordCount = sentence.split(/\s+/).filter(Boolean).length; // Get the number of words in the current sentence

    if ((wordCount + currentSentenceWordCount) > count) {
      splitSentences.push(currentContent.trim());
      currentContent = sentence;
      wordCount = currentSentenceWordCount;
    } else {
      currentContent += ' ' + sentence;
      wordCount += currentSentenceWordCount;
    }
  }

  if (currentContent) {
    splitSentences.push(currentContent.trim());
  }

  return splitSentences;
}

