// chrome.webRequest.onBeforeRequest.addListener(
//   function (details) {
//     console.log({ details })
//     console.log(chrome.runtime.getURL("tabs/index.html"))
//     // chrome.scripting.executeScript(
//     //   {
//     //     target: { tabId: details.tabId },
//     //     function: () => { console.log('XXX') },
//     //     args: [details.url],
//     //   },
//     //   () => { console.log('ZZZ') });

//     return { redirectUrl: chrome.runtime.getURL("tabs/index.html") };
//   },
//   {
//     urls: ["chrome-extension://" + chrome.runtime.id + "/tabs/index.html/*"]
//   }, [
//   "blocking"
// ]);