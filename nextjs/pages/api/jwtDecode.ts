import type { NextApiRequest, NextApiResponse } from 'next';
const jwt = require('jsonwebtoken')

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  const { data: token } = req.body;

  //only accept post requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  if (!token) {
    return res.status(400).json({ message: 'No data in the request' });
  }

  try {
    const data = jwt.decode(token, 'secret');
    res.send({
      data
    });

    console.log({ token, data })
  } catch (error) {
    console.error(error);
    res.send({
      error: error.message
    });
  }
}
