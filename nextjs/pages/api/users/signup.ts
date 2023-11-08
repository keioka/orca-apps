import type { NextApiRequest, NextApiResponse } from 'next';
import { createUser, findUserByProviderId } from '@/models/user';
import { validateToken, setCustomUserClaims } from '@/firebase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {

  //only accept post requests
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    await validateToken(req, res)

    const auth = req.auth
    if (!auth) {
      return res.status(401).json({ message: 'Failed to validate token' });
    }

    const newUser = await createUser({
      providerId: auth.uid,
      providerName: auth.firebase.signInProvider,
      username: auth.name || auth.uid,
      thirdPartyId: auth.uid,
      thirdPartyName: "firebase",
    })

    return res.status(200).json(newUser);
  } catch (err) {
    console.error(err)
    return res.status(500).json({ message: 'Something went wrong' });
  }
}
