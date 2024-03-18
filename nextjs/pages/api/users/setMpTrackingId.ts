import { NextApiRequest, NextApiResponse } from 'next';
import { setMpTrackingId } from '@/models/user';
import { validateToken } from '@/firebase';
import { setCurrentUser } from '@/middleware/setCurrentUser';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      await validateToken(req, res)
      await setCurrentUser(req)
    } catch (err) {
      console.error(err)
      return res.status(401).json({ error: { code: "AUTH/NOT_FOUND", message: 'AUTH_NOT_FOUND' } });
    }

    if (req.currentUser?.id === undefined) {
      return res.status(401).json({ code: "AUTH/NOT_FOUND", error: "follow: Unauthorized" });
    }

    console.log("mpTrackingId", req.body.mpTrackingId)
    console.log("currentUser", req.currentUser.id)

    await setMpTrackingId(req.currentUser.id, req.body.mpTrackingId)
    return res.status(200).json({ message: "ok" })
  } else {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
}
