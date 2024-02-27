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


function openNewTab(param) {
  chrome.tabs.create({
    url: "./tabs/welcome.html"
  })
}

chrome.runtime.onInstalled.addListener((details) => {
  if (details?.reason === 'install') {
    //  chrome.tabs.sendMessage(tab.id, { target: 'onInstall' })
    openNewTab('installed')
  }
})

function setDailyAlarm() {
  const now = new Date();
  const target = new Date(now);
  target.setHours(21, 0, 0, 0); // Set target to today 9 PM

  // If now is past 9 PM, set target to next day 9 PM
  if (now > target) {
    target.setDate(target.getDate() + 1);
  }

  const when = target.getTime();
  const periodInMinutes = 24 * 60; // Daily

  chrome.alarms.create('dailyNotification', {
    when,
    periodInMinutes
  });


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


