import type { NextApiRequest, NextApiResponse } from 'next';
import { validateToken } from '@/firebase';
import { setCurrentUser } from '@/middleware/setCurrentUser';
import { findUserById } from '@/models/user';
import { createLesson, listLessons } from '@/models/lesson';
// import { getParaphrase } from '@/utils/openai/paraphrase';
import { getParaphrase } from '@/utils/apis/ai21/paraphrase';
import * as ParaphraseModel from '@/models/paraphrase';
import * as MessageModel from '@/models/message';
import * as SentenceModel from '@/models/sentence';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {

  try {
    const { error } = await validateToken(req, res)
    if (error) {
      return res.status(401).json({ error });
    }

    await setCurrentUser(req, res)
    if (req.currentUser?.id === undefined) {
      return res.status(401).json({ code: "AUTH/NOT_FOUND", error: "follow: Unauthorized" });
    }
  } catch (error) {
    console.error(error)
    return res.status(401).json({ code: "AUTH/NOT_FOUND", message: 'AUTH_NOT_FOUND' });
  }

  if (req.method === 'POST') {
    try {
      return await createParaphraseHandler(req, res)
    } catch (err) {
      console.error(err)
      return res.status(500).json({ code: "PARAPHRASE/CREATE", message: "Failed to create paraphrases" });
    }
  } else {
    return res.status(405).json({ code: "METHOD_NOT_ALLOWED", message: 'Method not allowed' });
  }

}

async function createParaphraseHandler(req: NextApiRequest, res: NextApiResponse) {
  const { messageId } = req.query;
  const { sentence, sentenceIndex } = req.body;

  if (!messageId || !sentence || sentenceIndex == null) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const sentenceInst = await SentenceModel.findSentenceByIndex({
      messageId: parseInt(messageId as string),
      sentenceIndex: sentenceIndex
    })

    if (sentenceInst) {
      const paraphrases = await ParaphraseModel.findParaphrasesBySentenceId(sentenceInst.id)
      if (paraphrases.length > 0) {
        return res.status(200).json({ phrases: paraphrases });
      }
    }

    const { phrases } = await getParaphrase({
      sentence: sentence as string
    })

    // Check if the message with the given messageId exists
    const message = await MessageModel.findMessageById(messageId as string)

    if (!message) {
      return res.status(404).send('Message not found');
    }

    // Check if the sentence with the given sentenceIndex exists for the message
    let targetSentence = await SentenceModel.findSentenceByIndex({
      messageId: parseInt(messageId as string),
      sentenceIndex: sentenceIndex
    });

    // If the sentence doesn't exist, create it
    if (!targetSentence) {
      targetSentence = await SentenceModel.createSentence({
        content: sentence,
        messageId: parseInt(messageId),
        sentenceIndex: sentenceIndex
      });
    }

    if (!targetSentence) {
      return res.status(500).send('Error creating sentence');
    }

    const newPhrases = await Promise.all(phrases.map(async (phrase: { sentence: string, tone: string }) => {
      // Create the paraphrase for the sentence
      try {
        const newParaphrase = await ParaphraseModel.createParaphrase({
          content: phrase.sentence,
          type: phrase.tone,    // Default type, change as needed
          sentenceId: targetSentence.id // attach it to the existing sentence if it exists
        });
        return newParaphrase
      } catch (err) {
        console.error(err)
        return Promise.resolve(null)
      }
    }))

    return res.status(200).json({ phrases: newPhrases.filter((phrase) => phrase), messageId, sentenceIndex });

  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: err.message });
  }
}