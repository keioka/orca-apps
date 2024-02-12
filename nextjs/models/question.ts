import { Publisher } from '@prisma/client'; // Import Prisma and PublisherUpdateInput from Prisma client
import prisma from '../db'

interface QuestionParams {
  content: string;
  paragraphNumber: number;
  materialId: string;
  translation: {
    langCode: string;
    content: string;
  }
}

export async function createQuestions(questions: QuestionParams[]) {
  const result = []
  for (const question of questions) {
    try {
      const q = await prisma.question.create({
        data: {
          content: question.content,
          paragraphNumber: question.paragraphNumber,
          materialId: question.materialId,
          translation: {
            create: {
              content: question.translation.content,
              language: {
                connect: {
                  code: question.translation.langCode
                }
              }
            }
          }
        },
        include: {
          translation: {
            select: {
              content: true,
              language: {
                select: {
                  code: true
                }
              }
            }
          }
        }
      })
      result.push(q)
    } catch (error: any) {
      if (error.code === 'P2002') {
        console.log(`Question already exists: ${error.meta.target[0].name}`)
      } else {
        console.error(error)
      }
    }
  }
  return result
}

export function getQuestionsByMaterialId(materialId: string) {
  return prisma.question.findMany({
    where: {
      materialId,
    },
    include: {
      translation: {
        select: {
          content: true,
          language: {
            select: {
              code: true
            }
          }
        }
      }
    }
  })
}
