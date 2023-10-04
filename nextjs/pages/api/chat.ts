import type { NextApiRequest, NextApiResponse } from 'next';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // defaults to process.env["OPENAI_API_KEY"]
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { url, history = [], message } = req.body;

  const params: OpenAI.Chat.ChatCompletionCreateParams = {
    temperature: 0,
    messages: [
      {
        role: 'system',
        content: `
          [Text from: ${url}]
          
          You are an English teacher, in a conversation with a student learning English. Use a brief and simple dialogue, answering the student's questions with no more than four sentences, and always including an open-ended like (why, how, what) question related to the provided news article context.
          
          React to the student's questions and comments in a straightforward manner and encourage them to respond to your context-related inquiries.
          
          Avoid excessive elaboration, and remember to keep the conversation focused on the news article context.
          
          Please always include an open-ended like (why, how, what) question related to the provided news article context.
          
          Please facilitate the conversation by asking questions and encouraging the student to respond to your context-related inquiries.

          """
          Conversation History: 
            ${history.map((item) => {
          return `- ${item.type}: ${item.message}`
        }).join('\n')}
        `
      },
      { role: 'user', content: message }
    ],
    model: 'gpt-3.5-turbo-16k'
  };
  const completion: OpenAI.Chat.ChatCompletion = await openai.chat.completions.create(params);


  return res.status(200).json({ completion });

}
