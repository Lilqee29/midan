// Midan Chrome Extension - Google Meet Content Script
// Captures transcript from Google Meet calls

(function () {
  "use strict";

  let lastTranscript = "";
  let isCapturing = false;

  // Watch for transcript changes
  const observer = new MutationObserver((mutations) => {
    if (!isCapturing) return;

    const transcriptEl = document.querySelector('[data-panel-id="captions"]');
    if (transcriptEl) {
      const currentText = transcriptEl.innerText;
      if (currentText !== lastTranscript) {
        lastTranscript = currentText;
      }
    }
  });

  // Start observing when in a Meet
  function startObserving() {
    const target = document.body;
    if (target) {
      observer.observe(target, {
        childList: true,
        subtree: true,
        characterData: true,
      });
      isCapturing = true;
    }
  }

  // Get current transcript
  function getTranscript() {
    const transcriptEl = document.querySelector('[data-panel-id="captions"]');
    if (transcriptEl) {
      return transcriptEl.innerText;
    }

    // Alternative selectors for different Meet layouts
    const altSelectors = [".ryQhQe", '[jsname="C6IqW"]', ".nMqFnf"];
    for (const selector of altSelectors) {
      const el = document.querySelector(selector);
      if (el) return el.innerText;
    }

    return null;
  }

  // Listen for messages from popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === "CAPTURE_TRANSCRIPT") {
      const transcript = getTranscript();
      sendResponse({ transcript });
    }
    return true;
  });

  // Auto-start when page loads
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startObserving);
  } else {
    startObserving();
  }
})();
