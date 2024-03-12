import { NextApiRequest, NextApiResponse } from 'next';
import * as Material from '@/models/material';
import { syncArticleByExternalId } from '@/common/contentful/syncArticle';
import { getEntryWithLocale, formatContentfullEntryWithLocale } from '@/common/contentful';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { externalId } = req.query
    const result = await getEntryWithLocale(externalId as string)
    const content = await formatContentfullEntryWithLocale(result)

    let material = await Material.getMaterialByExternalId(externalId)
    if (!material) {
      const { newArticle } = await syncArticleByExternalId(externalId as string)
      return res.status(200).json({ ...newArticle, content })
    }
    res.status(200).json({ ...material, content })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Internal server error' })
  }
}