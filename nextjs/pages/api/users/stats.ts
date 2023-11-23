import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/db';
import { validateToken } from '@/firebase';
import { setCurrentUser } from '@/middleware/setCurrentUser';
import moment from 'moment';

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
  if (req.method === 'GET') {
    try {
      await validateToken(req, res)
      await setCurrentUser(req, res)
    } catch (err) {
      console.error(err)
      return res.status(401).json({ error: { code: "AUTH/NOT_FOUND", message: 'AUTH_NOT_FOUND' } });
    }

    const { currentUser } = req
    const userId = currentUser.id

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
        return Object.keys(dataByDay).map((date) => ({
          date: new Date(date),
          label: moment(date).format('MM/DD'),
          value: dataByDay[date].length
        }))
      }

      // Group each category by day
      const lessonsByDay = groupByDay(lessons);
      const vocabulariesByDay = groupByDay(vocabularies);
      const paraphrasesByDay = groupByDay(paraphrases);
      const messagesByDay = groupByDay(messages);

      const wordCountByDay = Object.keys(messagesByDay).map(date => {
        const count = messagesByDay[date].reduce((total, message) => total + message.content.split(' ').length, 0);
        return {
          date: new Date(date), // The date in YYYY-MM-DD format
          value: count, // The total word count for this date
          label: moment(date).format('MM/DD') // The label in MM/DD format
        };
      });

      // Format and send response
      return res.status(200).json({
        lessonsByDay: getCountByDay(lessonsByDay),
        vocabulariesByDay: getCountByDay(vocabulariesByDay),
        paraphrasesByDay: getCountByDay(paraphrasesByDay),
        wordCountByDay: wordCountByDay
      });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'An error occurred while fetching user stats' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}