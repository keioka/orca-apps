import axios from 'axios';
import type { PlasmoMessaging } from "@plasmohq/messaging"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const token = req.body.token;

  try {
    const response = await fetch(`${process.env.PLASMO_PUBLIC_API_ROOT}/api/users/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      }
    });

    const data = await response.json();

    if (response.status !== 200) {
      return res.send({
        error: data.error
      });
    }

    if (data.error) {
      return res.send({
        error: data.error
      });
    }

    return res.send({
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

