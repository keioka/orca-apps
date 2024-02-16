
import type { PlasmoMessaging } from "@plasmohq/messaging"

const ROOT_URL = process.env.PLASMO_PUBLIC_API_ROOT

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const token = req.body.token;
  const materialId = req.body.materialId;
  let data
  try {
    const response = await fetch(
      `${ROOT_URL}/api/materials/${materialId}/lesson`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      }
    );
    data = await response.json();
  } catch (error) {
    console.error(error);
  }

  if (!data) {
    try {
      const response = await fetch(`${ROOT_URL}/api/lessons`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            materialId,
          })
        }
      ); // Replace w
      data = await response.json();

    } catch (error) {
      console.error(error);
      res.send({
        error: error.message
      });
    }
  }

  res.send({
    data
  });
}

export default handler