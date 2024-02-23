import axios from 'axios';
import type { PlasmoMessaging } from "@plasmohq/messaging"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const token = req.body.token;
  const messageId = req.body.messageId;
  const sentenceIndex = req.body.sentenceIndex;

  try {
    const queryParams: string[] = [];

    if (messageId) {
      queryParams.push(`messageId=${messageId}`);
    }
    if (sentenceIndex) {
      queryParams.push(`sentenceIndex=${sentenceIndex}`);
    }

    let baseUrl = `${process.env.PLASMO_PUBLIC_API_ROOT}/api/paraphrases/saved`;
    const url = queryParams.length ? `${baseUrl}?${queryParams.join('&')}` : baseUrl;

    const result = await fetch(url, {
      method: "GET",
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