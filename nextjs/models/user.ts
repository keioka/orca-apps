import prisma from '../db'

export async function createUser({
  username,
  thirdPartyName,
  thirdPartyId,
  providerName,
  providerId
}: {
  username: string;
  thirdPartyName: "supabase" | "firebase" | "auth0";
  thirdPartyId: string;
  providerName: "email" | "github" | "google" | "facebook" | "twitter";
  providerId: string;
}): Promise<any> {
  const user = await prisma.user.create({
    data: {
      username,
      auth: {
        create: {
          thirdPartyName,
          thirdPartyId,
          providerName,
          providerId,
        },
      },
    },
    include: {
      auth: true,
    },
  });

  return user
}


export async function findUserById(id: string) {
  const user = await prisma.user.findFirst({
    where: {
      id
    },
  });

  return user;
}

export async function findUserByProviderId(providerId: string) {
  try {
    const user = await prisma.user.findFirst({
      where: {
        auth: {
          providerId,
        },
      },
    });

    return user;
  } catch (error) {
    console.error('Error finding user by provider ID:', error);
    return null
  }
}

export async function setMpTrackingId(userId: string, mpTrackingId: string) {
  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      mpTrackingId,
    },
  });
}