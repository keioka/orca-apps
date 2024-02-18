import { getVocabsFromUrl } from '../openai/vocab'
import prisma from '../prisma'

const langName = {
  'ja': 'Japanese',
  'en': 'English',
  'vi': 'Vietnamese',
}

export async function addVocabsAndParse(req: any, res: any) {
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

  const url = material.url

  const { vocabs } = await getVocabsFromUrl({
    id: pid,
    url,
    transLangCode: transLangCodeCap
  })


  return {
    status: 'ok',
    vocabs: vocabs.flat()
  }
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
