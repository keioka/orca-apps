
import type { PlasmoMessaging } from "@plasmohq/messaging"

const ROOT_URL = process.env.PLASMO_PUBLIC_API_ROOT

function fetchMaterialByUrl(url: string): Promise<Material> {
  return fetch(`${ROOT_URL}/api/materials/url?url=${url}`)
}


function createMaterialByUrl(url: string): Promise<Material> {
  return fetch(`${ROOT_URL}/api/materials`, {
    method: "POST",
    body: JSON.stringify({
      url
    }),
    headers: {
      "Content-Type": "application/json"
    }
  })
}

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const url = req.body.url;

  try {
    const response = await fetchMaterialByUrl(url)

    let data = await response.json();

    if (!data || !data.material) {
      const response = await createMaterialByUrl(url)

      data = await response.json()

      if (!data) {
        res.send({
          error: "Error creating material"
        });
      }

      if (response.status !== 201) {
        res.send({
          error: data
        });
      }
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