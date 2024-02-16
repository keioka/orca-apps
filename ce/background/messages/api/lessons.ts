import axios from 'axios';
import type { PlasmoMessaging } from "@plasmohq/messaging"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const url = req.body.url;
  const token = req.body.token;
  const materialId = req.body.materialId;

  try {
    const result = await fetch(`${process.env.PLASMO_PUBLIC_API_ROOT}/api/lessons`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        url,
        materialId
      })
    });

    if (!result.ok) {
      console.error("Error fetching material");
      console.error(result);
      console.error(await result.json());
      throw new Error("Error fetching material");
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