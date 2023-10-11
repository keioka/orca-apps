import { type PlasmoMessaging } from "@plasmohq/messaging"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  console.log("openPopup message received")
  try {
    chrome.tabs.create({
      url: chrome.runtime.getURL("popup.html"),
    });
    res.send({ message: "Popup opened" });
  } catch (error) {
    console.error(error);
    res.send({
      error: error.message
    });
  }
}

export default handler