// Midan Chrome Extension - Background Service Worker

// Listen for extension install
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    console.log("Midan extension installed");
    // Open settings page on first install
    chrome.tabs.create({ url: "http://localhost:3000/settings" });
  }
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "EXTRACT_ACTION_ITEMS") {
    handleExtraction(request.notes)
      .then(sendResponse)
      .catch((error) => sendResponse({ error: error.message }));
    return true; // Keep message channel open for async response
  }
});

async function handleExtraction(notes) {
  const { apiKey } = await chrome.storage.local.get("apiKey");

  if (!apiKey) {
    throw new Error("API key not configured");
  }

  const response = await fetch("http://localhost:3000/api/extract", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ notes }),
  });

  if (!response.ok) {
    throw new Error("Extraction failed");
  }

  return response.json();
}

// Listen for tab updates to detect Google Meet
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url?.includes("meet.google.com")) {
    // Could show badge or notification here
    chrome.action.setBadgeText({ text: "LIVE", tabId });
    chrome.action.setBadgeBackgroundColor({ color: "#0D9488", tabId });
  } else if (changeInfo.status === "complete") {
    chrome.action.setBadgeText({ text: "", tabId });
  }
});
