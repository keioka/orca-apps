import { getVocabsFromText, getVocabsFromUrl } from '../openai/vocab'
import prisma from '../prisma'
import { parseWebText } from '../helpers/parser'

const langName = {
  'ja': 'Japanese',
  'en': 'English',
  'vi': 'Vietnamese',
}

export async function addVocabs(req: any, res: any) {
  console.log('addVocabs start')
  const { materialId, transLangCode = 'ja' } = req.body;

  if (!materialId) {
    throw new Error(`Missing required fields`)
  }

  const material = await prisma.material.findUnique({
    where: {
      id: materialId,
    },
    include: {
      publisher: true,
    },
  });

  if (!material) {
    throw new Error(`Material not found: ${materialId}`)
  }

  const text = await parseWebText(material.url)

  if (!text) {
    const { vocabs } = await getVocabsFromUrl({ id: materialId, url: material.url, transLangCode })
    const mappedVocabs = vocabs.map((vocab) => {
      return {
        ...vocab,
        translation: vocab[`meaningIn${langName[transLangCode.toLowerCase()]}`],
        langCode: transLangCode
      }
    })

    const newVocabs = await createVocabs({
      vocabParams: mappedVocabs,
      materialId
    })

    return {
      status: 'ok',
      vocabs: newVocabs
    }
  }

  const cleanedText = text.replace(/\s+/g, ' ').trim()
  const splitContent = splitTextBySentenceWithWordCount(cleanedText, 125)
  const transLangCodeCap = transLangCode[0].toUpperCase() + transLangCode.slice(1).toLowerCase()

  splitContent.forEach(async (content, index) => {
    const pid = `${materialId}_${index}`

    console.time(pid)
    const { vocabs } = await getVocabsFromText({
      id: pid,
      text: content.replace(/\s+/g, ' ').trim(),
      transLangCode: transLangCodeCap
    })

    const mappedVocabs = vocabs.map((vocab) => {
      return {
        ...vocab,
        translation: vocab[`meaningIn${langName[transLangCode.toLowerCase()]}`],
        langCode: transLangCode
      }
    })

    try {
      return await createVocabs({
        vocabParams: mappedVocabs,
        materialId
      })
    } catch (error) {
      console.error(error)
      return []
    } finally {
      console.timeEnd(pid)
    }
  })

  return {
    status: 'ok',
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



export async function createVocabs({ materialId, vocabParams }: { materialId: string, vocabParams: VocabParams[] }): Promise<Vocab> {
  for (const vocabParam of vocabParams) {
    try {
      await prisma.vocabulary.create({
        data: {
          word: vocabParam.word,
          meaning: vocabParam.meaning,
          materialId: materialId,
          sentence: vocabParam.sentence,
          pronounce: vocabParam.pronounce,
          pos: vocabParam.pos,
          example: vocabParam.example,
          level: vocabParam.level,
          translation: {
            create: {
              content: vocabParam.translation,
              language: {
                connect: {
                  code: vocabParam.langCode
                }
              }
            }
          }
        }
      })
    } catch (error: any) {
      if (error.code === 'P2002') {
        console.log(`Vocab already exists: ${error.meta.target[0].name}`)
      } else {
        console.error(error)
      }
    }
  }
}


// export async function createVocabs({ materialId, vocabParams }: { materialId: string, vocabParams: VocabParams[] }): Promise<Vocab> {
//   for (const vocabParam of vocabParams) {
//     try {
//       await prisma.material.update({
//         where: {
//           id: materialId
//         },
//         data: {
          
//         }
//       })
//     } catch (error: any) {
//       if (error.code === 'P2002') {
//         console.log(`Vocab already exists: ${error.meta.target[0].name}`)
//       } else {
//         console.error(error)
//       }
//     }
//   }
// }
