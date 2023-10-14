import { fetchAndStoreRSS } from "@/common/fetchRSS";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { url } = req.body;

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  if (!url) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const { vocabs } = await fetchAndStoreRSS({
      url
    })

    return res.status(200).json({ vocabs });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
