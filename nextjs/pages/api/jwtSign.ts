import type { NextApiRequest, NextApiResponse } from 'next';
const jwt = require('jsonwebtoken')

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { data } = req.body;

  //only accept post requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!data) {
    return res.status(400).json({ message: 'No data in the request' });
  }

  try {
    const token = jwt.sign({ data }, 'secret', { expiresIn: '1h' })
    res.send({
      token
    });
  } catch (error) {
    console.error(error);
    res.send({
      error: error.message
    });
  }
}
