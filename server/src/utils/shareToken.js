// src/utils/shareToken.js
// Short, URL-safe random token for client preview links.
// Uses Node's built-in crypto — no extra dependency needed.
const crypto = require("crypto");

function generateShareToken() {
  return crypto.randomBytes(9).toString("base64url"); // e.g. "kQ3f7z9mN2wq1A"
}

module.exports = generateShareToken;
