import type { NextApiRequest, NextApiResponse } from 'next';
import { createUser, findUserByProviderId } from '@/models/user';
import { validateToken } from '@/supabase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { question, history } = req.body;

  //only accept post requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await validateToken(req, res)
    const supabaseUser = req.user
    if (!supabaseUser) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await findUserByProviderId(supabaseUser.id)
    if (user) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const newUser = await createUser({
      providerId: supabaseUser.id,
      providerName: "email",
      username: supabaseUser.user_metadata.full_name || "Anonymous",
      thirdPartyId: supabaseUser.id,
      thirdPartyName: "supabase",
    })

    return res.status(200).json(newUser);
  } catch (err) {
    console.error(err)
    return res.status(500).json({ error: 'Something went wrong' });
  }
}
