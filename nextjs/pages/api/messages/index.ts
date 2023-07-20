import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient, MessageCreateInput } from '@prisma/client';

const prisma = new PrismaClient();

interface RequestBody extends MessageCreateInput {
  lessonId: number;
}

export default async function handle(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { message, lessonId }: RequestBody = req.body;

    if (!message || !lessonId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
      const newMessage = await prisma.messages.create({
        data: {
          message,
          lesson: {
            connect: { id: lessonId },
          },
        },
      });

      return res.status(200).json(newMessage);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Something went wrong' });
    } finally {
      async () => {
        await prisma.$disconnect();
      };
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}