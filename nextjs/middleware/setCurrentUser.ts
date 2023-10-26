import {
  NextApiRequest,
  NextApiResponse,
} from 'next';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const setCurrentUser = async (req: NextApiRequest) => {

  console.log("========setCurrentUser======")

  if (!req.fbUid) {
    throw new Error('No auth in req context')
  }

  try {
    const auth = await prisma.auth.findUnique({
      where: {
        providerId: req.fbUid,
      },
      include: {
        user: true, // Include the related user in the response
      },
    });

    if (!auth || !auth.user) {
      throw new Error('No auth in DB')
    }

    req.currentUser = auth.user;
  } catch (err) {
    console.error(err)
    throw new Error("Failed to set current user");
  } finally {
    prisma.$disconnect()
  }
}