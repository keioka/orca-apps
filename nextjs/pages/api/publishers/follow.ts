import { NextApiRequest, NextApiResponse } from "next";
import { followPublishers, getFollowPublishers } from "@/models/publisher";
import { validateToken } from '@/firebase';
import { setCurrentUser } from '@/middleware/setCurrentUser';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") {
    const { publisherIds } = req.body
    await validateToken(req, res)
    await setCurrentUser(req, res)

    if (req.currentUser?.id === undefined) {
      return res.status(401).json({ error: "follow: Unauthorized" });
    }

    const followPublishers = await getFollowPublishers({ userId: req.currentUser?.id })
    const followPublisherIds = followPublishers.map((followPublisher) => followPublisher.publisherId)
    return res.status(200).json({ publisherIds: followPublisherIds });

  } else if (req.method === "POST") {
    const { publisherIds } = req.body
    await validateToken(req, res)
    await setCurrentUser(req, res)

    if (!publisherIds) {
      return res.status(400).json({ error: "follow: Missing required parameters" });
    }

    if (req.currentUser?.id === undefined) {
      return res.status(401).json({ error: "follow: Unauthorized" });
    }

    const publishers = publisherIds.map((publisherId: string) => {
      return { publisherId, userId: req.currentUser?.id }
    })

    await followPublishers({ publishers });
    return res.status(201).json({ publisherIds });
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
};