import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';
import { validateToken } from '@/firebase';
import { findUserById } from '@/models/user';
import { createLesson, listLessons } from '@/models/lesson';
import { OpenAIApi, Configuration } from 'openai';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const prisma = new PrismaClient();
const openai = new OpenAIApi(configuration);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // await validateToken(req, res)
  // const { currentUser } = req
  // if (!currentUser) {
  //   return res.status(401).json({ message: 'CurrentUser is empty' });
  // }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // const { messageId } = req.body;

  try {
    // Fetch the message content from the database using Prisma
    // const message = await prisma.message.findUnique({ where: { id: messageId } });

    // if (!message) {
    //   return res.status(404).json({ error: 'Message not found' });
    // }

    const text = "I think it is really bad idea" // message.fullContent;

    const prompt = `
      ${text}
    `


    // Create a more detailed prompt with the message content

    // Send the prompt to OpenAI API

    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system", content: `
            You are a English teacher. 
            Please make 5 suggestions how to reply to certain message for English learner.
            The format should be in an array of string like below:
            [{ content: "string", rate: "number"}]
          `
        },
        { role: "user", content: prompt }
      ],
    });

    const result = response.data.choices[0].message
    if (!result || !result.content) {
      return res.status(500).json({ error: 'No response from OpenAI' });
    }
    const suggestions = JSON.parse(result.content)

    res.status(200).json({ suggestions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
}
