import type { PlasmoMessaging } from "@plasmohq/messaging"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const { lang } = req.body;
  console.log("setLang message received", lang);
  await chrome.storage.local.set({ lang })
}

export default handler