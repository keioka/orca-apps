import { Sentence } from "@prisma/client";
import prisma from '../db'

interface SentenceQuery {
  messageId: number;
  sentenceIndex: number;
}

interface SentenceCreation extends SentenceQuery {
  content: string;
}


export async function findSentenceByIndex({ messageId, sentenceIndex }: SentenceQuery): Promise<Sentence | null> {
  return prisma.sentence.findFirst({
    where: {
      messageId: messageId,
      sentenceIndex: sentenceIndex
    }
  });
};

export async function createSentence({ messageId, content, sentenceIndex }: SentenceCreation): Promise<Sentence> {
  return prisma.sentence.create({
    data: {
      content: content,
      messageId: messageId,
      sentenceIndex: sentenceIndex
    }
  });
};