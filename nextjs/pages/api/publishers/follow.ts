import { NextApiRequest, NextApiResponse } from "next";
import { followPublishers, getFollowPublishers, getFollowPublishersCategory } from "@/models/publisher";
import { validateToken } from '@/firebase';
import { setCurrentUser } from '@/middleware/setCurrentUser';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") {

    try {
      const { error } = await validateToken(req, res)
      if (error) {
        return res.status(401).json({ error });
      }
      await setCurrentUser(req, res)
    } catch (error) {
      console.error(error)
      return res.status(401).json({ code: "AUTH_NOT_FOUND", message: 'AUTH_NOT_FOUND' });
    }

    if (req.currentUser?.id === undefined) {
      return res.status(401).json({ error: "follow: Unauthorized" });
    }

    try {
      const followPublishers = await getFollowPublishers({ userId: req.currentUser?.id })
      const categories = await getFollowPublishersCategory({ userId: req.currentUser?.id })

      console.log("followPublishers", followPublishers)

      const followPublisherInfo = followPublishers.map((followPublisher) => ({ publisherId: followPublisher.publisher.id, category: followPublisher.publisher.category }))
      const followPublisherCategories = categories.map((followPublisher) => followPublisher.category)

      return res.status(200).json({ followPublishers: followPublisherInfo, categories: followPublisherCategories });
    } catch (error) {
      console.error(error)
      return res.status(500).json({ message: 'Internal server error' });
    }
  } else if (req.method === "POST") {

    const { publisherIds } = req.body
    if (!publisherIds) {
      return res.status(400).json({ error: "follow: Missing required parameters" });
    }
    try {
      const { error } = await validateToken(req, res)
      if (error) {
        return res.status(401).json({ error });
      }
      await setCurrentUser(req, res)
    } catch (error) {
      console.error(error)
      return res.status(401).json({ code: "AUTH/NOT_FOUND", message: 'AUTH_NOT_FOUND' });
    }

    if (req.currentUser?.id === undefined) {
      return res.status(401).json({ error: "follow: Unauthorized" });
    }

    try {
      const publishers = publisherIds.map((publisherId: string) => {
        return { publisherId, userId: req.currentUser?.id }
      })

      await followPublishers({ publishers });

      const followPublisherInfos = await getFollowPublishers({ userId: req.currentUser?.id })
      const followPublisherInfo = followPublisherInfos.map((followPublisher) => ({ publisherId: followPublisher.publisher.id, category: followPublisher.publisher.category }))
      const categories = await getFollowPublishersCategory({ userId: req.currentUser?.id })
      const followPublisherCategories = categories.map((followPublisher) => followPublisher.category)

      return res.status(201).json({ followPublishers: followPublisherInfo, categories: followPublisherCategories });
    } catch (error) {
      console.error(error)
      return res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
};