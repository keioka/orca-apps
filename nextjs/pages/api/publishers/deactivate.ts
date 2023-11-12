import type { NextApiRequest, NextApiResponse } from 'next'
import { deactivatePublishers } from '@/models/publisher'

export default async function deactivatePublishersByIds(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' })
  }
  const publisherIds = req.body.publisherIds
  try {
    const ids = await deactivatePublishers(publisherIds)
    res.status(200).json({ ids })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Something went wrong.' })
  }
}

