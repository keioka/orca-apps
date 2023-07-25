import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function createMessage({
  message,
  createdById,
  lessonId
}: {
  message: string;
  createdById?: string;
  lessonId: string;
}) {

  const data = {
    fullContent: message,
    lesson: {
      connect: {
        id: Number(lessonId),
      }
    }
  }

  if (createdById) {
    data.createdBy = {
      connect: {
        id: createdById,
      }
    }
  }

  // Create new message
  const newMessage = await prisma.message.create({
    data
  });

  return newMessage
}

export async function listMessages(lessonId: string) {
  const messages = await prisma.message.findMany({
    where: {
      lessonId: Number(lessonId),
    },
    include: {
      createdBy: true,
    },
  })

  return messages
}