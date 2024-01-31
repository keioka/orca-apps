import prisma from '../db'

const getVocabInclude = (langCode: string = 'ja') => {
  return {
    vocabulary: {
      include: {
        translation: {
          where: {
            language: {
              code: langCode
            },
          },
          include: {
            language: true
          }
        },
        material: true
      }
    }
  }
}

export async function saveVocab({ userId, vocabId }: { vocabId: number, userId: string }) {
  return await prisma.savedVocabularies.create({
    data: {
      vocabularyId: vocabId,
      userId
    },
    include: getVocabInclude()
  })
}

export async function unsaveVocab({ userId, vocabId }: { vocabId: number, userId: string }) {

}

export async function fetchSavedVocab({ userId, langCode }: { userId: string, langCode: string }) {
  return await prisma.savedVocabularies.findMany({
    where: {
      userId
    },
    include: getVocabInclude()
  })
}