function getLevel(score) {
  if (score >= 5) return "High Risk";
  if (score >= 2) return "Suspicious";
  return "Safe";
}

export function analyzeUrl(url) {
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