import { NextApiRequest, NextApiResponse } from 'next';
import { getParaphrase } from '@/utils/openai/paraphrase';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { sentence } = req.body;

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  if (!sentence) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const { phrases } = await getParaphrase({
      sentence: sentence as string
    })

    return res.status(200).json({ phrases });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
