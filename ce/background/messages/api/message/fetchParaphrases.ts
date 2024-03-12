import axios from 'axios';
import type { PlasmoMessaging } from "@plasmohq/messaging"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const sentence = req.body.sentence;
  const sentenceIndex = req.body.sentenceIndex;
  const messageId = req.body.messageId;
  const token = req.body.token;

  try {

    const response = await fetch(
      `${process.env.PLASMO_PUBLIC_API_ROOT}/api/messages/${messageId}/paraphrase`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          sentence,
          sentenceIndex,
          messageId,
        })
      }
    );

    const data = await response.json();

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