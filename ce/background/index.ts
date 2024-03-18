import { fetchDeviceId } from '~/utils/fetchDeviceId'

chrome.tabs.onActivated.addListener(function (activeInfo) {
  chrome.tabs.onUpdated.addListener(async function (tabId, changeInfo, tab) {
    if (activeInfo.tabId === tabId && changeInfo.url) {
      console.log(`URL has changed to ${changeInfo.url}`)
      chrome.tabs.sendMessage(tabId, { name: "urlChange", url: changeInfo.url }, () => {
        console.log("Message sent")
      })
    }
  })
})

function openNewTab() {
  chrome.tabs.create({
    url: "./tabs/welcome.html"
  })
}

chrome.runtime.onInstalled.addListener((details) => {
  if (details?.reason === 'install') {
    //  chrome.tabs.sendMessage(tab.id, { target: 'onInstall' })
    openNewTab()
    fetchDeviceId()
  }
})