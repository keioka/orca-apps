import type { PlasmoMessaging } from "@plasmohq/messaging"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  // const url = req.body.url;
  console.log("publishers message received");
  try {
    const result = await fetch(`${process.env.PLASMO_PUBLIC_API_ROOT}/api/publishers`, {
      method: "GET",
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await result.json();

    if (!result.ok) {
      console.error("Error fetching publishers");
      throw new Error("Error fetching publishers");
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