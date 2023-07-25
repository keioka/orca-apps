import type { NextApiRequest, NextApiResponse } from 'next';
import { createUser, findUserByProviderId } from '@/models/user';
import { validateToken, setCustomUserClaims } from '@/firebase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { providerId } = req.body;

  //only accept post requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!providerId) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    await validateToken(req, res)

    const newUser = await createUser({
      providerId: providerId,
      providerName: "email",
      username: "Anonymous",
      thirdPartyId: providerId,
      thirdPartyName: "firebase",
    })

    await setCustomUserClaims(providerId, { user: newUser })

    return res.status(200).json(newUser);
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Something went wrong' });
  }
}
