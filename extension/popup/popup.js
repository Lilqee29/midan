// Midan Chrome Extension - Popup Script

const API_BASE = "http://localhost:3000";

// DOM Elements
const authScreen = document.getElementById("auth-screen");
const mainScreen = document.getElementById("main-screen");
const apiKeyInput = document.getElementById("api-key");
const connectBtn = document.getElementById("connect-btn");
const authStatus = document.getElementById("auth-status");
const notesInput = document.getElementById("notes-input");
const captureBtn = document.getElementById("capture-btn");
const extractBtn = document.getElementById("extract-btn");
const resultsSection = document.getElementById("results-section");
const resultsContent = document.getElementById("results-content");
const loadingSection = document.getElementById("loading-section");
const newExtractionBtn = document.getElementById("new-extraction-btn");
const settingsBtn = document.getElementById("settings-btn");

// Initialize
async function init() {
  const { apiKey } = await chrome.storage.local.get("apiKey");
  if (apiKey) {
    showMainScreen();
  }
}

// Auth
connectBtn.addEventListener("click", async () => {
  const apiKey = apiKeyInput.value.trim();

  if (!apiKey) {
    showAuthStatus("Please enter your API key", "error");
    return;
  }

  connectBtn.disabled = true;
  connectBtn.textContent = "Connecting...";

  try {
    const response = await fetch(`${API_BASE}/api/validate-key`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiKey }),
    });

    const data = await response.json();

    if (data.valid) {
      await chrome.storage.local.set({ apiKey });
      showMainScreen();
    } else {
      showAuthStatus("Invalid API key. Please check your key in Midan settings.", "error");
    }
  } catch (error) {
    showAuthStatus("Cannot connect to Midan server. Is it running?", "error");
  } finally {
    connectBtn.disabled = false;
    connectBtn.textContent = "Connect to Midan";
  }
});

function showAuthStatus(message, type) {
  authStatus.textContent = message;
  authStatus.className = `status ${type}`;
  authStatus.classList.remove("hidden");
}

function showMainScreen() {
  authScreen.classList.add("hidden");
  mainScreen.classList.remove("hidden");
}

// Extract action items
extractBtn.addEventListener("click", async () => {
  const notes = notesInput.value.trim();

  if (!notes) {
    alert("Please paste your meeting notes first");
    return;
  }

  showLoading(true);

  try {
    const { apiKey } = await chrome.storage.local.get("apiKey");

    const response = await fetch(`${API_BASE}/api/extract`, {
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

    const data = await response.json();
    showResults(data);
  } catch (error) {
    alert("Extraction failed. Please try again.");
  } finally {
    showLoading(false);
  }
});

// Capture from Google Meet
captureBtn.addEventListener("click", async () => {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab?.url?.includes("meet.google.com")) {
      alert("Please open a Google Meet call first");
      return;
    }

    // Inject content script to capture transcript
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: captureMeetTranscript,
    });

    const transcript = results[0]?.result;
    if (transcript) {
      notesInput.value = transcript;
      notesInput.dispatchEvent(new Event("input"));
    } else {
      alert("No transcript found. Make sure the transcript panel is open.");
    }
  } catch (error) {
    alert("Failed to capture transcript. Make sure you're in a Google Meet call.");
  }
});

// This function runs in the Meet tab context
function captureMeetTranscript() {
  // Try to find the transcript panel
  const transcriptContainer = document.querySelector('[data-panel-id="captions"]');
  if (!transcriptContainer) {
    // Try alternative selector
    const altContainer = document.querySelector('.ryQhQe');
    if (!altContainer) return null;
    return altContainer.innerText;
  }
  return transcriptContainer.innerText;
}

// Show/hide loading
function showLoading(show) {
  loadingSection.classList.toggle("hidden", !show);
  extractBtn.disabled = show;
}

// Display results
function showResults(data) {
  const { groupedByPerson } = data;

  let html = "";

  for (const [person, items] of Object.entries(groupedByPerson)) {
    html += `
      <div class="result-person">
        <div class="person-header">
          <div class="person-avatar">${person[0]}</div>
          <span class="person-name">${person}</span>
          <span class="task-count">${items.length} task${items.length !== 1 ? "s" : ""}</span>
        </div>
    `;

    for (const item of items) {
      const priorityClass = item.priority || "normal";
      const due = item.due_resolved || item.due_raw || "No deadline";

      html += `
        <div class="task-item">
          <div class="task-text">${item.task}</div>
          <div class="task-meta">
            <span class="badge ${priorityClass}">${priorityClass}</span>
            <span>${due}</span>
          </div>
        </div>
      `;
    }

    html += "</div>";
  }

  resultsContent.innerHTML = html;
  notesInput.parentElement.classList.add("hidden");
  resultsSection.classList.remove("hidden");
}

// New extraction
newExtractionBtn.addEventListener("click", () => {
  notesInput.value = "";
  notesInput.parentElement.classList.remove("hidden");
  resultsSection.classList.add("hidden");
});

// Settings
settingsBtn.addEventListener("click", () => {
  chrome.tabs.create({ url: `${API_BASE}/settings` });
});

// Initialize
init();
