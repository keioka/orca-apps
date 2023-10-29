import prisma from '../db'

export async function createMessage({
  message,
  type,
  createdById,
  lessonId
}: {
  message: string;
  type: "user" | "ai";
  createdById?: string;
  lessonId: string;
}) {

  const data = {
    content: message,
    type,
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

export async function findMessageById(messageId: string) {
  return await prisma.message.findUnique({
    where: { id: parseInt(messageId) }
  });
}

export async function addParaphrase(messageId: string) {

}
