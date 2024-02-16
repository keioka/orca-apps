import type { PlasmoMessaging } from "@plasmohq/messaging"

const ROOT_URL = process.env.PLASMO_PUBLIC_API_ROOT

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const materialId = req.body.materialId;
  const url = req.body.url;
  try {
    const response = await fetch(`${ROOT_URL}/api/vocabs`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        materialId: materialId,
        url: url,
      })
    });

    const data = await response.json();

    res.send({
      data
    })
  } catch (error) {
    console.error(error);
    res.send({
      error: error.message
    });
  }
}

export default handler