// Tracks the state of the zapper for each tab
const tabZapperState = {};

// Function to inject the content script
function injectContentScript(tabId) {
  browser.scripting.executeScript({
    target: { tabId: tabId },
    files: ["content_script.js"]
  }).then(() => {
    console.log("Element Zapper content script injected.");
    // Send a message to the content script to initialize
    browser.tabs.sendMessage(tabId, { command: "initZapper" });
  }).catch(err => console.error("Failed to inject content script:", err));
}

// Function to notify content script to remove listeners
function deactivateContentScript(tabId) {
  browser.tabs.sendMessage(tabId, { command: "deactivateZapper" })
    .catch(err => console.log("No active zapper to deactivate or content script not ready:", err));
}

// Listen for clicks on the browser action (toolbar button)
browser.action.onClicked.addListener((tab) => {
  if (!tab.id) {
    console.error("Tab ID is missing.");
    return;
  }

  // Toggle the zapper state for the current tab
  tabZapperState[tab.id] = !tabZapperState[tab.id];

  if (tabZapperState[tab.id]) {
    // Activate Zapper
    browser.action.setIcon({
      tabId: tab.id,
      path: {
        16: "icon16.png",
        32: "icon32.png"
      }
    });
    browser.action.setTitle({ tabId: tab.id, title: "Deactivate Element Zapper" });
    injectContentScript(tab.id);
  } else {
    // Deactivate Zapper
    browser.action.setIcon({
      tabId: tab.id,
      path: {
        16: "icon16.png",
        32: "icon32.png"
      }
    });
    browser.action.setTitle({ tabId: tab.id, title: "Activate Element Zapper" });
    deactivateContentScript(tab.id);
  }
});

// Clean up state when a tab is closed
browser.tabs.onRemoved.addListener((tabId) => {
  delete tabZapperState[tabId];
});

// Reset icon when a page is loaded/reloaded in a tab where zapper was active
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tabZapperState[tabId] && (changeInfo.status === 'complete' || changeInfo.url)) {
    // If zapper was active, re-inject content script or re-initialize
    // For simplicity, we'll just ensure the icon is correct and re-inject if necessary.
    // A more robust solution might involve checking if the script is already there.
    browser.action.setIcon({
      tabId: tab.id,
      path: {
        16: "icon16.png",
        32: "icon32.png"
      }
    });
    browser.action.setTitle({ tabId: tab.id, title: "Deactivate Element Zapper" });
    injectContentScript(tab.id);
  } else if (!tabZapperState[tabId]) {
     browser.action.setIcon({
      tabId: tab.id,
      path: {
        16: "icon16.png",
        32: "icon32.png"
      }
    });
    browser.action.setTitle({ tabId: tab.id, title: "Activate Element Zapper" });
  }
});