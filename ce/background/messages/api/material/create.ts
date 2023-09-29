import type { PlasmoMessaging } from "@plasmohq/messaging"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {

  const data = async function fetchMetadata(url: string) {

    return fetch(`${process.env.API_ROOT}/api/materials`,
      {
        method: "POST",
        body: {
          url: url
        }
      }
    )

  }

  res.send({
    data
  })
}

export default handler