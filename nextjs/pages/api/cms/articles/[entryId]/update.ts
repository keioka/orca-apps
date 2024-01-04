import { NextApiRequest, NextApiResponse } from 'next';
import { getMaterials, createMaterial, getMaterialByUrl, upsertMaterial } from '@/models/material'
import { getEntry, updateEntry } from '@/common/contentful'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const entryId = req.query.entryId
    const entry = await getEntry(entryId)
    const contentTypeId = entry.sys.contentType.sys.id
    const environmentId = entry.sys.environment.sys.id
    const version = entry.sys.revision
    console.log("version", entry.sys)

    const jaData = {
      title: "",
      p1: "",
      p1Vocab: "",
      p2: "",
      p2Vocab: "",
      p3: "",
      p3Vocab: "",
      p4: "",
      p4Vocab: "",
      p5: "",
      p5Vocab: "",
      p6: "",
      p6Vocab: "",
    }

    try {
      const result = await updateEntry({
        entryId,
        contentTypeId,
        environmentId,
        version,
        fields: {
          ...entry.fields,
          title: {
            "ja": jaData.title
          },
          description: {
            "ja": jaData.description
          },
          p1: {
            "ja": jaData.p1,
          },
          "p1-vocab": {
            "ja": jaData.p1Vocab
          },
          p2: {
            "ja": jaData.p2
          },
          "p2-vocab": {
            "ja": jaData.p2Vocab
          },
          p3: {
            "ja": jaData.p3
          },
          "p3-vocab": {
            "ja": jaData.p3Vocab
          },
          p4: {
            "ja": jaData.p4
          },
          "p4-vocab": {
            "ja": jaData.p4Vocab
          },
          p5: {
            "ja": jaData.p5
          },
          "p5-vocab": {
            "ja": jaData.p5Vocab
          },
          p6: {
            "ja": jaData.p6
          },
          "p6-vocab": {

          }
        }
      })
    } catch (error) {
      console.error(error)
    }

    return res.status(200).json({
      // result
    });
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}