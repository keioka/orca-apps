import type { PlasmoMessaging } from "@plasmohq/messaging"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  console.log("openNote message received")
  // open note
  chrome.tabs.create({ url: chrome.runtime.getURL("tabs/index.html") })
  res.send({ message: "opened note" })
}

export default handler