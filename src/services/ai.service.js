import OpenAI from "openai";
import Ajv from "ajv";
import { searchSimilar, storeIssue } from "./vector.service.js";

let similarIssues;
let client = null;
const ajv = new Ajv();
const SYSTEM_PROMPT = `
You are a senior security code reviewer.

Return ONLY valid JSON in this format:
{
  "issues": [
    {
      "type": "string",
      "severity": "low|medium|high|critical",
      "file": "string",
      "line": number,
      "description": "string",
      "fix": "string"
    }
  ]
}

Rules:
- No markdown
- No explanation outside JSON
- Focus on security + logic bugs
`;

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
  similarIssues = await searchSimilar(chunk);

  const enrichedPrompt = `
  Previous similar issues:
  ${similarIssues.join("\n")}

  ${SYSTEM_PROMPT}
  `;

  // FALLBACK MODE (no API key / quota)
  if (!client) {
    return mockResponse(chunk);
  }

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4.1",
      messages: [
        { role: "system", content: enrichedPrompt },
        { role: "user", content: chunk },
      ],
      temperature: 0.2,
      response_format: { type: "json_object" },
    });

    const schema = {
      type: "object",
      properties: {
        issues: {
          type: "array",
          items: {
            type: "object",
            required: ["type", "severity", "description", "fix"],
            properties: {
              type: { type: "string" },
              severity: { type: "string" },
              description: { type: "string" },
              fix: { type: "string" },
            },
          },
        },
      },
      required: ["issues"],
    };

    const content = response.choices[0].message.content;
    const validate = ajv.compile(schema);
    const parsed = JSON.parse(content);
    if (!validate(parsed)) {
      throw new Error("INVALID_AI_RESPONSE");
    }
    // Store results in Chroma 
    for (const issue of parsed.issues) {
      // optional: store only meaningful issues
      if (["high", "critical"].includes(issue.severity?.toLowerCase())) {
        await storeIssue(issue);
      }
    }
    return parsed;
    
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