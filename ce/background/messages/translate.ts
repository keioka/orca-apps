import type { PlasmoMessaging } from "@plasmohq/messaging"
import axios from "axios"

async function translate({ text, lang = 'ja' }: { text: string, lang: string }): { error?: string, result?: string } {

  try {
    const result = await fetch(`${process.env.PLASMO_PUBLIC_API_ROOT}/api/translate`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text,
        lang
      })
    });

    const data = await result.json();

    if (!result.ok) {
      console.log({ data })
      console.error("Error fetching translate");
    }

    return { result: data }
  } catch (error) {
    console.error("There was a problem with the request:", error);
    return { error: error.message };
  }
}


const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const { text, lang } = req.body;
  console.log("translate message received", text, lang);
  try {
    const { result } = await translate({ text, lang })

    res.send(result);
  } catch (error) {
    console.error(error);
    res.send({
      error: error.message
    });
  }
}

export default handler