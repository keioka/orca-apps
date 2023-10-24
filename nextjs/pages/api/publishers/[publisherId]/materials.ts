// pages/api/material.ts

import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";

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

      res.status(200).json({ materials });
    } catch (error) {
      console.error("Error fetching materials:", error);
      res.status(500).json({ error: "Error fetching materials" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
};
