import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const keywords = [{
    query: 'Japan fund scandal',
    label: '自民政治資金問題',
    type: 'search'
  },
  {
    query: 'japan wage',
    label: '賃上げ2024',
    type: 'search'
  },
  {
    query: 'us election 2024',
    label: '米国大統領選2024',
    type: 'search'
  }]
  return res.status(200).json(keywords);
}
