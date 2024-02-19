import axios from 'axios';
import type { PlasmoMessaging } from "@plasmohq/messaging"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const token = req.body.token;
  const uid = req.body.uid;

  console.log({ token, uid })

  if (!token || !uid) {
    return res.send({
      error: "Invalid token or uid"
    });
  }

  try {
    const response = await fetch(`${process.env.PLASMO_PUBLIC_API_ROOT}/api/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({
        providerId: uid,
      })
    });

    const data = await response.json();

    if (response.status !== 201) {
      console.error(response)
      return res.send({
        error: data
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