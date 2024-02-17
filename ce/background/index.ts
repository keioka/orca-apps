chrome.tabs.onActivated.addListener(function (activeInfo) {
  chrome.tabs.onUpdated.addListener(async function (tabId, changeInfo, tab) {
    if (activeInfo.tabId === tabId && changeInfo.url) {
      console.log(`URL has changed to ${changeInfo.url}`)
      console.log({ tabId, changeInfo, tab })
      chrome.tabs.sendMessage(tabId, { name: "urlChange", url: changeInfo.url }, () => {
        console.log("Message sent")
      })
    }
  })
})