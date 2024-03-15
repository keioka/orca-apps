import type { PlasmoMessaging } from "@plasmohq/messaging"

const handler: PlasmoMessaging.MessageHandler = async (req, res) => {
  const { notificationId, notificationOptions } = req.body;

  console.log({ chrome })
  chrome.notifications.create(notificationId, notificationOptions, (notificationId) => {
    console.log('Notification created:', notificationId);

    return res.send({ notificationId });
  });
}

export default handler