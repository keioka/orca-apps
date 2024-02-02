import prisma from '../db'

export async function createAudioFile(filePath: string) {
  const newAudioFile = await prisma.audioFile.create({
    data: {
      path: filePath
    }
  });

  return newAudioFile
}