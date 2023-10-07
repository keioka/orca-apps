import type { PlasmoMessaging } from "@plasmohq/messaging"
import axios from "axios"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const {
    url,
    message,
    history
  } = req.body;

  try {
    const result = await fetch(`${process.env.PLASMO_PUBLIC_API_ROOT}/api/chat`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url,
        message,
        history
      })
    });

    const data = await result.json();

    if (!result.ok) {
      console.error("Error fetching material");
      throw new Error("Error fetching material");
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