import axios from 'axios';
import type { PlasmoMessaging } from "@plasmohq/messaging"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const lessonId = req.body.lessonId;
  const token = req.body.token;
  const message = req.body.message;
  const type = req.body.type;

  try {
    const result = await fetch(`${process.env.PLASMO_PUBLIC_API_ROOT}/api/lessons/${lessonId}/messages`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        message,
        type,
      })
    });

    const data = await result.json();

    if (result.status !== 201) {
      res.send({ error: data });
      return
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