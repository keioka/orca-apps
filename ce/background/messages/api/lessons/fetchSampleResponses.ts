import axios from 'axios';
import type { PlasmoMessaging } from "@plasmohq/messaging"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const token = req.body.token;
  const lessonId = req.body.lessonId

  try {
    const result = await fetch(`${process.env.PLASMO_PUBLIC_API_ROOT}/api/lessons/${lessonId}/sample`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await result.json();

    if (!result.ok) {
      console.error(data);
      res.send({
        error: data
      });
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