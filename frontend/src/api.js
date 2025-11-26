const API_BASE = (import.meta.env.VITE_API_BASE || "http://localhost:8000") + "/api";

// =======================
// FUNDS API
// =======================

export async function fetchTop10() {
  const res = await fetch(`${API_BASE}/funds/top10`);
  if (!res.ok) throw new Error("Failed to fetch top10");
  return res.json();
}

export function downloadTop10CSV() {
  window.open(`${API_BASE}/export/csv`, "_blank");
}

export async function fetchAllFunds() {
  const res = await fetch(`${API_BASE}/funds`);
  if (!res.ok) throw new Error("Failed to fetch all funds");
  return res.json();
}

// ❗ FIXED UPDATE ENDPOINT (previously wrong)
/*
Old:  /api/funds/update  ❌ (404)
New:  /api/update        ✅
*/
export async function triggerUpdate() {
  const res = await fetch(`${API_BASE}/update`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to trigger update");
  return res.json();
}

// =======================
// NEWS API
// =======================

export async function fetchNews() {
  const res = await fetch(`https://mc-api-j0rn.onrender.com/api/news`);
  if (!res.ok) throw new Error("Failed to fetch news");
  return res.json();
}

export async function fetchLatestNews() {
  const res = await fetch(`https://mc-api-j0rn.onrender.com/api/latest_news`);
  if (!res.ok) throw new Error("Failed to fetch latest news");
  return res.json();
}

export async function fetchBusinessNews() {
  const res = await fetch(`https://mc-api-j0rn.onrender.com/api/business_news`);
  if (!res.ok) throw new Error("Failed to fetch business news");
  return res.json();
}

export async function fetchList() {
  const res = await fetch(`https://mc-api-j0rn.onrender.com/api/list`);
  if (!res.ok) throw new Error("Failed to fetch list");
  return res.json();
}

// =======================
// GEMINI API
// =======================

export const callGeminiApi = async (prompt, onResponse, onError, systemPrompt, useGrounding = true) => {
  const defaultSystemPrompt =
    "You are a friendly, concise, and helpful financial assistant named 'Wisbee'. Provide short, actionable advice.";

  const apiKey = import.meta.env.VITE_API_KEY;
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    tools: useGrounding ? [{ google_search: {} }] : undefined,
    systemInstruction: { parts: [{ text: systemPrompt || defaultSystemPrompt }] },
  };

  const maxRetries = 5;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        if (response.status === 429 && attempt < maxRetries - 1) {
          await new Promise((r) => setTimeout(r, Math.pow(2, attempt) * 1000));
          continue;
        }
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const result = await response.json();
      const candidate = result.candidates?.[0];

      if (!candidate?.content?.parts?.[0]?.text)
        throw new Error("Invalid Gemini response");

      const text = candidate.content.parts[0].text;

      const sources =
        candidate.groundingMetadata?.groundingAttributions
          ?.map((a) => ({
            uri: a.web?.uri,
            title: a.web?.title,
          }))
          ?.filter((s) => s.uri && s.title) || [];

      onResponse({ text, sources });
      return;
    } catch (err) {
      if (attempt === maxRetries - 1) {
        onError("Gemini API failed after 5 attempts.");
        return;
      }
    }
  }
};
