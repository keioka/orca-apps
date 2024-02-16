import type { PlasmoMessaging } from "@plasmohq/messaging"

const ROOT_URL = process.env.PLASMO_PUBLIC_API_ROOT

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const materialId = req.body.materialId;
  try {
    const response = await fetch(`${ROOT_URL}/api/materials/${materialId}/vocabs`);
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