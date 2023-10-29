import prisma from '../db'

export async function saveVocab({ userId, vocabId }: { vocabId: number, userId: string }) {
  return await prisma.savedVocabularies.create({
    data: {
      vocabularyId: vocabId,
      userId
    },
    include: {
      vocabulary: {
        include: {
          translation: true,
          material: true
        }
      }
    }
  })
}

export async function unsaveVocab({ userId, vocabId }: { vocabId: number, userId: string }) {

}

export async function fetchSavedVocab({ userId, langCode }: { userId: string, langCode: string }) {
  return await prisma.savedVocabularies.findMany({
    where: {
      userId
    },
    include: {
      vocabulary: {
        include: {
          translation: {
            where: {
              language: {
                code: langCode
              }
            }
          },
          material: true
        }
      }
    }
  })
}