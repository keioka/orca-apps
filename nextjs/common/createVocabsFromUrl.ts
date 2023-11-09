import { getVocabsFromText } from '@/utils/openai';
import { getMaterialById, createVocabs } from '@/models/material';
import { parseWebText } from '@/utils/webParser';
import { capitalize } from 'lodash';
import { sleep } from 'openai/core';

export async function createVocabsFromUrl({ materialId, url, transLangCode }: { materialId: string, url: string, transLangCode: string }) {
  try {
    let text
    if (url) {
      text = await parseWebText(url)
    } else if (materialId) {
      const material = await getMaterialById(materialId)
      if (!material) {
        throw new Error('Material not found')
      }
      text = await parseWebText(material.url)
    }

    if (!text) {
      console.error("Missing text");
      throw new Error('Failed to parse text')
    }

    const cleanedText = text.replace(/\s+/g, ' ').trim()
    console.log({ cleanedText })
    const splitContent = splitTextBySentenceWithWordCount(cleanedText, 125)

    const transLangCodeCap = capitalize(transLangCode)

    splitContent.forEach(async (content, index) => {
      await sleep(1000)
      const { vocabs } = await getVocabsFromText({
        id: `${materialId}_${index}`,
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

      await createVocabs({
        vocabParams: mappedVocabs,
        materialId
      })

      return mappedVocabs
    })
  } catch (error) {
    console.error(error);
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

