import axios from 'axios';
import type { PlasmoMessaging } from "@plasmohq/messaging"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  try {
    const result = await fetch(`${process.env.PLASMO_PUBLIC_API_ROOT}/api/popularKeywords`, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!result.ok) {
      console.error("Error fetching material");
      console.error(result);
      return res.send({
        error: await result.json()
      });
    }

    const data = await result.json();

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