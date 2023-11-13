import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { fetchArticles } from "@/common/fetchArticles";
import prisma from "@/db";
import { addPublishers } from "@/common/addPublishers";
import createArticlesByPublisherIdsDefer from "@/defer/createArticlesByPublisherIds";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const { category, publishers } = req.body;
    try {
      if (!category) {
        return res.status(400).json({ error: "Missing required parameters" });
      }
      if (!publishers) {
        return res.status(400).json({ error: "Missing required parameters" });
      }
      if (!Array.isArray(publishers) || publishers.length === 0) {
        return res.status(400).json({ error: "Missing required parameters" });
      }

      const newPublishers = await addPublishers(publishers, category) || []
      if (newPublishers.length === 0) {
        return res.status(400).json({ error: "No publishers created" });
      }
      await createArticlesByPublisherIdsDefer({ publisherIds: newPublishers.map((publisher) => publisher.id) })
      res.status(201).json({ publishers: newPublishers });
    } catch (error) {
      console.error("Error creating material:", error);
      res.status(500).json({ error: "Error creating material" });
    }
  } else if (req.method === "GET") {
    const { category } = req.query;

    try {

      let publishers = []

      if (!category) {
        publishers = await prisma.publisher.findMany({
          where: {
            isActive: true
          }
        });
      } else {
        publishers = await prisma.publisher.findMany({
          where: {
            category: category as string,
            isActive: true
          },
        });
      }

      return res.status(200).json({ publishers });

    } catch (error) {
      console.error("Error fetching publishers:", error);
      res.status(500).json({ error: "Error fetching publishers" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
};