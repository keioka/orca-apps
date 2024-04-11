import type { PlasmoMessaging } from "@plasmohq/messaging"
import { Storage } from "@plasmohq/storage"

const storage = new Storage()


const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  console.log("login message received")
  chrome.identity.getAuthToken({ interactive: true }, async function (token) {
    console.log("token", token)
    if (chrome.runtime.lastError || !token) {
      console.error(chrome.runtime.lastError.message)
      res.send({ error: chrome.runtime.lastError })
      return
    }

    if (token) {
      await storage.set("firebase:token", token)
      res.send({ token })
      const data = await storage.get("firebase:token") // "value"
      chrome.runtime.sendMessage({ type: "login" })
      return token
    }
  })
}

export default handler