import axios from 'axios';
import type { PlasmoMessaging } from "@plasmohq/messaging"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const token = req.body.token;

  try {
    const result = await fetch(`${process.env.PLASMO_PUBLIC_API_ROOT}/api/lessons`, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await result.json();

    if (!result.ok) {
      res.send({
        error: data
      });
    }


    res.send({
      data
    });

  } catch (error) {
    console.error(error);
    res.send({
      error: error.message
    });
  }
}

export default handler