import OpenAI from "openai";

let client = null;

function getClient() {
  if (!client && process.env.OPENAI_API_KEY) {
    client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  return client;
}

export async function analyzeChunk(chunk) {
  const client = getClient();

  // 🔥 FALLBACK MODE (no API key / quota)
  if (!client) {
    return mockResponse(chunk);
  }

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4.1",
      messages: [{ role: "user", content: chunk }],
      temperature: 0.2,
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (err) {
    if (err.code === "insufficient_quota") {
      console.warn("⚠️ Quota exceeded → using mock AI");
      return mockResponse(chunk);
    }

    throw err;
  }
}

function mockResponse(chunk) {
  const issues = [];

  if (chunk.includes("SELECT") && chunk.includes("+")) {
    issues.push({
      type: "security",
      severity: "critical",
      file: "unknown",
      line: "unknown",
      description: "Possible SQL Injection via string concatenation",
      fix: "Use parameterized queries",
    });
  }

  if (chunk.includes("console.log")) {
    issues.push({
      type: "quality",
      severity: "low",
      file: "unknown",
      line: "unknown",
      description: "Debug log found",
      fix: "Remove console.log in production",
    });
  }

  return { issues };
}