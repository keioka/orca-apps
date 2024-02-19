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


// chrome.tabs.onActivated.addListener(function (activeInfo) {
//   console.log("onActivated")

//   const callback = (tab: chrome.tabs.Tab) => {
//     console.log("onActivated callback")
//     console.log(tab)
//     chrome.tabs.sendMessage(tab.id, { name: "tabActivated", tab }, () => {
//       console.log("Message sent")
//     })
//   }

//   chrome.contextMenus.create(
//     {
//       title: "Create Vocab",
//       contexts: ["selection"],
//       onclick: function (info, tab) {
//         console.log("item " + info.menuItemId + " was clicked")
//         console.log("info: " + JSON.stringify(info))
//         console.log("tab: " + JSON.stringify(tab))
//         chrome.tabs.sendMessage(tab.id, { name: "createVocab", info }, () => {
//           console.log("Message sent")
//         })
//       }
//     },
//     callback
//   )

// })


