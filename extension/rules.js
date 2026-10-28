const SUSPICIOUS_WORDS = ["urgent", "verify", "claim", "reward"];

function getLevel(score) {
  if (score >= 5) return "High Risk";
  if (score >= 2) return "Suspicious";
  return "Safe";
}

function cannotScan(reason) {
  return { score: 0, level: "Can't scan", reasons: [reason] };
}

export function analyzeUrl(url) {
  let parsed;
  try {
    parsed = new URL(url);
  } catch (error) {
    return cannotScan("Not a valid URL.");
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return cannotScan("Only http and https pages can be scanned.");
  }

  let reasons = [];
  let score = 0;

  if (parsed.protocol === "http:") {
    reasons.push("Connection is not encrypted (HTTP, not HTTPS).");
    score += 2;
  }

  // Query string (?...) aur fragment (#...) jaanbujh kar ignore hain.
  const textToCheck = (parsed.hostname + parsed.pathname).toLowerCase();
  const matched = SUSPICIOUS_WORDS.filter(word => textToCheck.includes(word));

  if (matched.length > 0) {
    score += Math.min(matched.length, 3);
    reasons.push("Suspicious word(s) in the address: " + matched.join(", ") + ".");
  }

  return { score: score, level: getLevel(score), reasons: reasons };
}