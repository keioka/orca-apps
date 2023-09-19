import type { PlasmoMessaging } from "@plasmohq/messaging"
import axios from "axios"


let loading = false;

async function translate({ text, lang = 'ja' }: { text: string, lang: string }): { error?: string, result?: string } {
  if (loading) {
    return;
  }
  loading = true;

  try {
    const result = await fetch("http://localhost:3000/api/translate", {
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
  } finally {
    loading = false;
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