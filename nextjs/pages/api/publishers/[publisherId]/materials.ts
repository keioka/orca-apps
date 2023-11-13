// pages/api/material.ts

import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import { createArticlesByPublisherId } from "@/common/createArticlesByPublisherId";

const prisma = new PrismaClient();

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "GET") {
    const { publisherId } = req.query;

    try {
      const materials = await prisma.material.findMany({
        where: {
          publisherId: publisherId as string,
        },
      });

      return res.status(200).json({ materials });
    } catch (error) {
      console.error("Error fetching materials:", error);
      return res.status(500).json({ error: "Error fetching materials" });
    }
  }

  if (req.method === "POST") {
    const { publisherId } = req.query;
    if (!publisherId) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    if (typeof publisherId !== "string") {
      return res.status(400).json({ error: "Invalid parameters" });
    }

    try {
      const { materials } = await createArticlesByPublisherId({ publisherId });
      return res.status(201).json({ materials });
    } catch (error) {
      console.error("Error adding materials:", error.message);
      return res.status(500).json({ error: "Error adding materials" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
};
