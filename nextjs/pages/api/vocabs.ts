import { NextApiRequest, NextApiResponse } from 'next';
import { createVocabsFromUrl } from "@/common/createVocabsFromUrl";
import axios from 'axios';

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
    const url = process.env.WORKSERVER_URL + "/add-vocabs"
    await axios.post(
      url,
      {
        materialId
      }
    )
    console.log("Successfully run add-vocabs")
  } catch (error) {
    console.error("Failed to run add-vocabs")
    console.error(error)
  }

  try {
    // const info = await createVocabsFromUrl({ materialId, url, transLangCode });
    return res.status(200).json({ status: "IN_PROGRESS", event });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message });
  }
}
