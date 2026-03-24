import { chunkDiff } from "./chunk.service.js";
import { analyzeChunk } from "./ai.service.js";

export async function processReview(diff) {
  const chunks = chunkDiff(diff);

  const results = await Promise.all(
    chunks.map((chunk) => analyzeChunk(chunk))
  );

  const merged = results.flatMap((r) => r.issues);

  return {
    totalIssues: merged.length,
    issues: dedupeIssues(merged),
  };
}

function dedupeIssues(issues) {
  const seen = new Set();

  return issues.filter((i) => {
    const key = `${i.file}-${i.line}-${i.description}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}