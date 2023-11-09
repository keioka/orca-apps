import { addPublishers } from "@/common/addPublishers";
import { NextApiRequest, NextApiResponse } from "next";
import { checkPublishersCrawledStatus } from "@/models/publisher";
import { createArticlesByPublisherId } from "@/common/createArticlesByPublisherId";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    try {
      const publishers = await checkPublishersCrawledStatus()
      const publishersToCrawl = publishers.slice(0, 10)

      const materials = await Promise.all(publishersToCrawl.map(async (publisher) => {
        const { materials } = await createArticlesByPublisherId({ publisherId: publisher.id })
        return materials
      }))

      res.status(201).json({ publishers: publishersToCrawl, size: publishers.length, materials });
    } catch (error) {
      console.error("Error adding publishers:", error.message);
      res.status(500).json({ error: "Error adding publishers" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
};