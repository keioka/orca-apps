import type { PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"

const storage = new Storage()

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  console.log("authCheck message received")

  const data = await storage.get("firebase:token") // "value"
  console.log({ data })
  res.send({ token: data })
}

export default handler