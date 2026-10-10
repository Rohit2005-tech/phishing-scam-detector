function getLevel(score) {
  if (score >= 5) return "High Risk";
  if (score >= 2) return "Suspicious";
  return "Safe";
}

function checkUrl(url) {
  let reasons = [];
  let score = 0;

  if (!url.startsWith("https")) {
    reasons.push("Not using HTTPS");
    score = score + 2;
  }

  let suspiciousWords = ["urgent", "verify", "claim", "reward"];
  let keywordCount = 0;
  for (let word of suspiciousWords) {
    if (url.includes(word)) {
      keywordCount = keywordCount + 1;
    }
  }

  if (keywordCount > 0) {
    let pointsToAdd = keywordCount;
    if (pointsToAdd > 3) {
      pointsToAdd = 3;
    }
    reasons.push("Contains " + keywordCount + " suspicious keyword(s)");
    score = score + pointsToAdd;
  }

  

  return {
    score: score,
    level: getLevel(score),
    reasons: reasons
  };
}

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

  let output = checkUrl(currentUrl);

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