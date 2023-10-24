import { fetchAndStoreRSS } from "@/common/fetchRSS";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { url, urls, category } = req.body;

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  if (!url && !urls) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // check if urls is an array
  if (urls && !Array.isArray(urls)) {
    return res.status(400).json({ message: 'urls must be an array' });
  }

  try {
    if (urls) {
      let allMaterials = [];
      for (const url of urls) {
        const { materials } = await fetchAndStoreRSS({
          url,
          category
        })
        allMaterials = [...allMaterials, ...materials];
      }
      return res.status(200).json({ materials: allMaterials });
    } else {
      const { materials } = await fetchAndStoreRSS({
        url,
        category
      })
      return res.status(200).json({ materials });
    }

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
