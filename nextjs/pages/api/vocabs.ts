import { NextApiRequest, NextApiResponse } from 'next';
import { createVocabsFromUrl } from "@/common/createVocabsFromUrl";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { url, materialId, transLangCode = 'ja' } = req.body;

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  if (!url && !materialId) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const info = await createVocabsFromUrl({ materialId, url, transLangCode });
    return res.status(200).json({ status: "IN_PROGRESS", info });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
}
