import axios from 'axios';
import type { PlasmoMessaging } from "@plasmohq/messaging"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const lessonId = req.body.lessonId;
  const token = req.body.token;

  if (!lessonId || !token) {
    return res.send({
      error: "Invalid lessonId or token"
    });
  }

  try {
    const result = await fetch(`${process.env.PLASMO_PUBLIC_API_ROOT}/api/lessons/${lessonId}/messages`, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await result.json();

    if (result.status !== 200) {
      console.error("Error fetching messages");
      console.error(result);
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