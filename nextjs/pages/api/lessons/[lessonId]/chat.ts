import axios from "axios";
import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { createMessage, addAudioFileToMessage } from "@/models/message";
import { validateToken } from '@/firebase';
import { setCurrentUser } from '@/middleware/setCurrentUser';
import { chat } from "@/utils/openai/chat";
import * as LessonModel from "@/models/lesson";
import * as AudioFileModel from "@/models/audioFile";

const prisma = new PrismaClient();

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    await createMessageHandler(req, res)
  }
}


async function createMessageHandler(req: NextApiRequest, res: NextApiResponse) {
  const { lessonId } = req.query;
  const { message } = req.body;
  await validateToken(req, res)
  await setCurrentUser(req, res)
  // Validate body parameters
  if (!lessonId) {
    return res.status(400).json({ error: "createMessageHandler: Missing required parameters" });
  }

  if (typeof lessonId !== "string") {
    return res.status(400).json({ error: "createMessageHandler: Invalid parameters" });
  }

  if (req.currentUser?.id === undefined) {
    return res.status(401).json({ error: "createMessageHandler: Unauthorized" });
  }

  const lesson = await LessonModel.getLesson(lessonId)

  if (!lesson) {
    return res.status(404).json({ message: "createMessageHandler: Lesson not found" });
  }

  if (lesson.userId !== req.currentUser?.id) {
    return res.status(403).json({ message: "createMessageHandler: Unauthorized" });
  }

  try {
    if (!message) {
      return res.status(400).json({ message: "createMessageHandler: Message cannot be empty" });
    }

    if (typeof message !== "string") {
      return res.status(400).json({ message: "createMessageHandler: Invalid parameters" });
    }

    const material = lesson.material
    const url = material?.url
    if (!url) {
      return res.status(400).json({ message: "createMessageHandler: Invalid parameters" });
    }

    const history = lesson.messages
    const messageResponse = await chat({ message, url, history })

    const aiMessage = await createMessage({ message: messageResponse, lessonId, createdById: req.currentUser?.id as string, type: "ai" });
    const audioResponse = await axios.post(
      process.env.LAMBDA_URL + '/chat_polly',
      {
        text: messageResponse,
        messageId: aiMessage.id
      },
      {
        headers: {
          "Content-Type": "application/json",
        }
      }
    )

    const { filePath } = audioResponse.data

    const audioFileDB = await AudioFileModel.createAudioFile(filePath)

    const updatedAIMessage = await addAudioFileToMessage({ audioFileId: audioFileDB.id, messageId: aiMessage.id })

    if (!lesson.initMessage) {
      await LessonModel.setInitMessage(lesson.id)
    }
    return res.status(201).json(updatedAIMessage);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "createMessageHandler: An error occurred while creating the message" });
  }
}