import type { PlasmoMessaging } from "@plasmohq/messaging"
import axios from "axios"


let loading = false;

async function paraphrase(sentence: string): { error?: string, result?: string } {
  if (loading) {
    return;
  }
  loading = true;

  try {
    const result = await fetch(`${process.env.PLASMO_PUBLIC_API_ROOT}/api/paraphrase`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        sentence
      })
    });

    const data = await result.json();

    console.log({ data, result })

    if (!result.ok) {
      console.log({ data })
      console.error("Error fetching paraphrase");
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
  const { sentence } = req.body;
  console.log("paraphrase message received", sentence);
  try {
    const { result } = await paraphrase(sentence)

    res.send(result);
  } catch (error) {
    console.error(error);
    res.send({
      error: error.message
    });
  }
}

export default handler