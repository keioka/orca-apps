import { PrismaClient } from '@prisma/client';
import type { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();


type StatsByDay = {
  [key: string]: number;
};

type ApiResponse = {
  lessonsByDay: StatsByDay;
  vocabulariesByDay: StatsByDay;
  paraphrasesByDay: StatsByDay;
  wordCountByDay: StatsByDay;
};


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse | { error: string }>
) {
  const { userId } = req.query;

  if (req.method === 'GET') {
    try {
      // Retrieve data for each category
      const lessons = await prisma.lesson.findMany({
        where: { userId },
        select: { createdAt: true }
      });
      const vocabularies = await prisma.savedVocabularies.findMany({
        where: { userId },
        select: { createdAt: true }
      });
      const paraphrases = await prisma.savedParaphrase.findMany({
        where: { userId },
        select: { createdAt: true }
      });
      const messages = await prisma.message.findMany({
        where: { createdById: userId, type: 'user' },
        select: { createdAt: true, content: true }
      });

      // Helper function to format date as YYYY-MM-DD
      const formatDate = (date) => date.toISOString().split('T')[0];

      // Group data by day
      const groupByDay = (data) => {
        return data.reduce((acc, item) => {
          const date = formatDate(item.createdAt);
          acc[date] = acc[date] || [];
          acc[date].push(item);
          return acc;
        }, {});
      };

      const getCountByDay = (dataByDay) => {
        return Object.keys(dataByDay).reduce((acc, date) => {
          acc[date] = dataByDay[date].length;
          return acc;
        }, {})
      }

      // Group each category by day
      const lessonsByDay = groupByDay(lessons);
      const vocabulariesByDay = groupByDay(vocabularies);
      const paraphrasesByDay = groupByDay(paraphrases);
      const messagesByDay = groupByDay(messages);
      // Format and send response
      res.status(200).json({
        lessonsByDay: getCountByDay(lessonsByDay),
        vocabulariesByDay: getCountByDay(vocabulariesByDay),
        paraphrasesByDay: getCountByDay(paraphrasesByDay),
        wordCountByDay: Object.keys(messagesByDay).reduce((acc, date) => {
          acc[date] = messagesByDay[date].reduce((total, message) => total + message.content.split(' ').length, 0);
          return acc;
        }, {})
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred while fetching user stats' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}