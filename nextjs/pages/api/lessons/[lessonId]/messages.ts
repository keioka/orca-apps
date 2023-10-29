import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { createMessage, listMessages } from "@/models/message";
import { validateToken } from '@/firebase';
import { setCurrentUser } from '@/middleware/setCurrentUser';
import { chat } from "@/utils/openai/chat";

const prisma = new PrismaClient();

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    await fetchMessagesHandler(req, res)
  }

  if (req.method === "POST") {
    await createMessageHandler(req, res)
  }
}


async function fetchMessagesHandler(req: NextApiRequest, res: NextApiResponse) {
  const { lessonId } = req.query;
  await validateToken(req, res)
  await setCurrentUser(req, res)
  // Validate body parameters
  if (!lessonId) {
    return res.status(400).json({ error: "fetchMessagesHandler: Missing required parameters" });
  }

  if (typeof lessonId !== "string") {
    return res.status(400).json({ error: "fetchMessagesHandler: Invalid parameters" });
  }

  if (req.currentUser?.id === undefined) {
    return res.status(401).json({ error: "fetchMessagesHandler: Unauthorized -> currentUser is empty" });
  }

  const lesson = await prisma.lesson.findUnique({
    where: {
      id: Number(lessonId),
    },
  });

  if (!lesson) {
    return res.status(404).json({ error: "fetchMessagesHandler: Lesson not found" });
  }

  if (lesson.userId !== req.currentUser?.id) {
    return res.status(403).json({ error: "fetchMessagesHandler: Not allowed" });
  }

  const messages = await listMessages(lessonId as string);
  return res.status(200).json(messages);
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

  const lesson = await prisma.lesson.findUnique({
    where: {
      id: Number(lessonId),
    },
    include: {
      messages: true,
      material: true,
    }
  });

  if (!lesson) {
    return res.status(404).json({ message: "createMessageHandler: Lesson not found" });
  }

  if (lesson.userId !== req.currentUser?.id) {
    return res.status(403).json({ message: "createMessageHandler: Not permitted" });
  }

  try {
    if (!message) {
      return res.status(400).json({ message: "createMessageHandler: Message cannot be empty" });
    }

    if (typeof message !== "string") {
      return res.status(400).json({ message: "createMessageHandler: Invalid parameters" });
    }

    const userMessage = await createMessage({ message, lessonId, createdById: req.currentUser?.id as string, type: "user" });

    return res.status(200).json(userMessage);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "createMessageHandler: An error occurred while creating the message" });
  }
}