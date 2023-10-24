import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { fetchArticles } from "@/common/fetchArticles";

const prisma = new PrismaClient();

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "POST") {
    const { publisherId, } = req.body;
    try {
      const materials = fetchArticles({ publisherId })
      res.status(201).json({ materials });
    } catch (error) {
      console.error("Error creating material:", error);
      res.status(500).json({ error: "Error creating material" });
    }
  } else if (req.method === "GET") {
    const { category } = req.query;

    try {

      let publishers = []

      if (!category) {
        publishers = await prisma.publisher.findMany();
      } else {
        publishers = await prisma.publisher.findMany({
          where: {
            category: category as string,
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