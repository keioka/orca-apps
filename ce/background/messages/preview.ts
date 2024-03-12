import type { PlasmoMessaging } from "@plasmohq/messaging"
import axios from "axios"

async function getPreview({ url }: { url: string }) {
  try {
    const result = await fetch(`${process.env.PLASMO_PUBLIC_API_ROOT}/api/metatag?url=${url}`, {
      method: "GET",
    });

    const data = await result.json();

    if (!result.ok) {
      console.error({ data })
      console.error("Error fetching preview");
    }

    return { result: data }
  } catch (error) {
    console.error("There was a problem with the request:", error);
    return { error: error.message };
  }
}


const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const { url } = req.body;
  console.log("preview message received", url);
  try {
    const { result } = await getPreview({ url })
    res.send({ result });
  } catch (error) {
    console.error(error);
    res.send({
      error: error.message
    });
  }
}

export default handler