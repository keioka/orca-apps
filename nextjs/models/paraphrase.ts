import { Paraphrase, SavedParaphrase } from "@prisma/client";
import prisma from '../db'

interface ParaphraseCreationArgs {
  type: string;
  sentenceId: number;
  content: string;
}

export const createParaphrase = async ({ sentenceId, content, type }: ParaphraseCreationArgs): Promise<Paraphrase> => {
  return prisma.paraphrase.create({
    data: {
      content,
      type,
      sentenceId
    }
  });
};

interface ParaphrasesCreationArgs {
  type: string;
  sentenceId: number;
  phrases: string[];
}

export const createParaphrases = async ({ sentenceId, phrases, type }: ParaphrasesCreationArgs): Promise<Paraphrase[]> => {
  return prisma.paraphrase.createMany({
    data: phrases.map((content: string) => ({
      content,
      type,
      sentenceId
    })),
    skipDuplicates: true
  });
};

export const findParaphrasesBySentenceId = async (sentenceId: number): Promise<Paraphrase[]> => {
  return prisma.paraphrase.findMany({
    where: {
      sentenceId
    }
  });
}

export const saveParaphrase = async ({ userId, paraphraseId }: { userId: string, paraphraseId: string }): Promise<SavedParaphrase> => {
  return prisma.savedParaphrase.create({
    data: {
      userId: userId,
      paraphraseId: parseInt(paraphraseId)
    },
    include: {
      paraphrase: {
        include: {
          sentence: {
            select: {
              id: true,
              content: true,
              message: {
                select: {
                  id: true,
                  content: true,
                  lesson: {
                    select: {
                      id: true,
                      material: {
                        select: {
                          id: true,
                          title: true,
                          url: true,
                          publisher: {
                            select: {
                              id: true,
                              name: true
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  })
}

interface FetchSavedParaphrasesArgs {
  userId: string;
  messageId?: string;
  sentenceIndex?: number;
}

interface FetchSavedParaphrasesArgs {
  userId: string;
  messageId?: string;
  sentenceIndex?: number;
}

export const fetchSavedParaphrases = async ({
  userId,
  messageId,
  sentenceIndex
}: FetchSavedParaphrasesArgs): Promise<SavedParaphrase[]> => {
  const whereConditions: any = {
    userId,
    paraphrase: {}
  };

  if (messageId) {
    whereConditions.paraphrase.sentenceMessageId = messageId;
  }

  if (typeof sentenceIndex !== 'undefined') {
    whereConditions.paraphrase.sentenceSentenceIndex = sentenceIndex;
  }

  return prisma.savedParaphrase.findMany({
    where: whereConditions,
    include: {
      paraphrase: {
        include: {
          sentence: {
            select: {
              id: true,
              message: {
                select: {
                  id: true,
                  content: true,
                  lesson: {
                    select: {
                      id: true,
                      material: {
                        select: {
                          id: true,
                          title: true,
                          url: true,
                          publisher: {
                            select: {
                              id: true,
                              name: true
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  });
}

// export const fetchSavedParaphrases = async ({
//   userId,
//   messageId,
//   sentenceIndex
// }: FetchSavedParaphrasesArgs): Promise<any[]> => {

//   let query = `
//     SELECT * FROM "saved_paraphrases"
//     INNER JOIN "paraphrases" ON "saved_paraphrases"."paraphrase_id" = "paraphrases"."id"
//     INNER JOIN "sentences" ON "paraphrases"."sentence_id" = "sentences"."id"
//     INNER JOIN "messages" ON "sentences"."message_id" = "messages"."id"
//     WHERE "saved_paraphrases"."user_id" = $1
//   `;

//   const params: (string | number)[] = [userId];

//   if (messageId) {
//     query += ' AND "sentences"."message_id" = $2';
//     params.push(parseInt(messageId));
//   }

//   if (typeof sentenceIndex !== 'undefined') {
//     const indexPlaceholder = messageId ? '$3' : '$2';
//     query += ` AND "sentences"."sentence_index" = ${indexPlaceholder}`;
//     params.push(parseInt(sentenceIndex));
//   }

//   return await prisma.$queryRawUnsafe(query, ...params);
// }

interface BelongsToUserArgs {
  userId: string;
  paraphraseId: string;
}


export async function pCheckSaveParaphrase({ userId, paraphraseId }: BelongsToUserArgs): Promise<boolean> {
  try {
    // Fetch the paraphrase along with its related sentence and message
    const paraphrase: Paraphrase | null = await prisma.paraphrase.findUnique({
      where: {
        id: parseInt(paraphraseId)
      },
      include: {
        sentence: {
          select: {
            message: {
              select: {
                createdById: true
              }
            }
          }
        }
      }
    });

    if (!paraphrase) {
      throw new Error('Paraphrase not found');
    }

    // Check if the message's createdById matches the provided userId
    return paraphrase.sentence.message.createdById === userId;
  } catch (error) {
    console.error('Error checking ownership:', error);
    return false;
  }
}
