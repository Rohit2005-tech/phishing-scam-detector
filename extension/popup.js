
import { analyzeUrl } from "./rules.js";

chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
  let currentTab = tabs[0];
  let currentUrl = currentTab.url;

  // FIX: pehle check karo URL exist karta hai ya nahi, phir startsWith chalao
  if (!currentUrl || !currentUrl.startsWith("http")) {
    document.getElementById("urlDisplay").textContent = "N/A";
    document.getElementById("levelDisplay").textContent = "Can't scan this page";
    document.getElementById("reasonsDisplay").textContent = "This is a browser-internal page, not a website.";
    return;
  }

let output = analyzeUrl(currentUrl); 
    document.getElementById("urlDisplay").textContent = currentUrl;
  let levelElement = document.getElementById("levelDisplay");

  if (output.level === "High Risk") {
    levelElement.style.color = "red";
  } else if (output.level === "Suspicious") {
    levelElement.style.color = "orange";
  } else {
    levelElement.style.color = "green";
  }

  levelElement.textContent = output.level + " (score: " + output.score + ")";
  document.getElementById("reasonsDisplay").textContent = output.reasons.join(", ") || "No red flags found";
});