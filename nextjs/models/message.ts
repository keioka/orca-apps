import prisma from '../db'

export async function addAudioFileToMessage({
  audioFileId,
  messageId
}: {
  audioFileId: string;
  messageId: string;
}) {
  return await prisma.message.update({
    where: {
      id: parseInt(messageId)
    },
    data: {
      audioFileId: parseInt(audioFileId)
    },
    include: {
      audioFile: {
        select: {
          path: true
        }
      }
    }
  });
}

export async function createMessage({
  message,
  type,
  createdById,
  lessonId
}: {
  message: string;
  type: "user" | "ai";
  createdById?: string | null;
  lessonId: string;
}) {

  const data = {
    content: message,
    type,
    lesson: {
      connect: {
        id: Number(lessonId),
      }
    },
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
      audioFile: true
    },
  })

  return messages
}

export async function findMessageById(messageId: string) {
  return await prisma.message.findUnique({
    where: { id: parseInt(messageId) }
  });
}
export async function createAuioFile(path: string) {
  return await prisma.audioFile.create({
    data: {
      path
    }
  });
}