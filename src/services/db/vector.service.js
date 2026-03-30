import { ChromaClient } from "chromadb";
import crypto from "crypto";

const client = new ChromaClient({
  path: "http://localhost:8000",
});

let collection;

export async function initVectorDB() {
  collection = await client.getOrCreateCollection({
    name: "code_issues",
  });
}

// Store issue
export async function storeIssue(issue) {
  const doc = `
Type: ${issue.type}
Severity: ${issue.severity}
Description: ${issue.description}
Fix: ${issue.fix}
`;

  await collection.add({
    ids: [Date.now().toString()],
    documents: [doc],
    metadatas: [
      {
        type: issue.type,
        severity: issue.severity,
        file: issue.file || "unknown",
      },
    ],
  });
}

// Search similar
export async function searchSimilar(diff) {
  const result = await collection.query({
    queryTexts: [diff],
    nResults: 3,
  });

  return result.documents?.[0] || [];
}

export async function storeIssue(issue) {
  if (!collection) {
    throw new Error("Vector DB not initialized");
  }

  // Normalize severity (important for consistency)
  const severity = normalizeSeverity(issue.severity);

  // Build meaningful document (VERY IMPORTANT for embeddings)
  const document = `
    Type: ${issue.type}
    Severity: ${severity}
    Description: ${issue.description}
    Fix: ${issue.fix}
    Code Context: ${issue.codeSnippet || ""}
    `;

  // Unique ID (avoid collisions)
  const id = generateId(issue);

  try {
    await collection.add({
      ids: [id],
      documents: [document],
      metadatas: [
        {
          type: issue.type,
          severity,
          file: issue.file || "unknown",
        },
      ],
    });
  } catch (err) {
    // prevent crash if duplicate or db issue
    console.warn("Failed to store issue:", err.message);
  }
}

function normalizeSeverity(sev = "") {
  const s = sev.toLowerCase();

  if (s.includes("critical")) return "critical";
  if (s.includes("high")) return "high";
  if (s.includes("medium")) return "medium";
  return "low";
}

function generateId(issue) {
  const raw = `${issue.type}-${issue.description}`;
  return crypto.createHash("md5").update(raw).digest("hex");
}