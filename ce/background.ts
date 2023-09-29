chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  console.log({ request, i: chrome.identity })
  if (request.type === "login") {
    try {
      chrome.identity.getAuthToken({ interactive: true }, async function (token) {
        if (chrome.runtime.lastError || !token) {
          console.error(chrome.runtime.lastError.message)
          sendResponse({ error: chrome.runtime.lastError })
          return
        }
        if (token) {
          console.log({ token })
          sendResponse({ token })
        }
      })
    } catch (e) {
      console.error(e)
    }
  }
});



