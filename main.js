
function startUrlReader(tab, url) {
    var tabId = tab ? tab.id : null;
    chrome.tabs.executeScript(tabId, { file: "libs/readability.js" });
    chrome.tabs.executeScript(tabId, { file: "libs/jquery-3.5.1.min.js" });
    chrome.tabs.executeScript(tabId, { file: "libs/jquery-ui-1.12.1.min.js" });
    chrome.tabs.executeScript(tabId, {
        code: `var SELECTED_URL = "${url}"`
    }, function () {
        chrome.tabs.executeScript(tabId, { file: 'app.js' });
    })

    chrome.browserAction.setBadgeBackgroundColor({ color: [242, 38, 19, 230] });
    chrome.browserAction.setBadgeText({ text: "go" });
    setTimeout(function () {
        chrome.browserAction.setBadgeText({ text: "" });
    }, 1000);
}

chrome.contextMenus.create({
    title: "View URL",
    id: "ur-context-menu",
    contexts: ["link"],
    onclick: function (info, tab) {
        startUrlReader(tab, info.linkUrl)

    }
});

