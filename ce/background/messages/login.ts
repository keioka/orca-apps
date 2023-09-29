import type { PlasmoMessaging } from "@plasmohq/messaging"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  console.log("login message received")
  chrome.identity.getAuthToken({ interactive: false }, async function (token) {
    if (chrome.runtime.lastError || !token) {
      console.error(chrome.runtime.lastError.message)
      res.send({ error: chrome.runtime.lastError })
      return
    }
    if (token) {
      console.log({ token })
      res.send({ token })
    }
  })
}

export default handler