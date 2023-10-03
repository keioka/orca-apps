import type { PlasmoMessaging } from "@plasmohq/messaging"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const url = req.body.url;
  console.log("material message received", url);
  try {
    const result = await fetch(`${process.env.PLASMO_PUBLIC_API_ROOT}/api/materials`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url
      })
    });

    const data = await result.json();

    if (!result.ok) {
      console.log({ data })
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