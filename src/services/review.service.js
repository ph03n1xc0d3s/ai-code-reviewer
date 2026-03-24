import { parseDiff } from "./diff.service.js";
import { analyzeChunk } from "./ai.service.js";
import { runRules } from "../rules/index.js";

export async function processReview(diff) {
  const files = parseDiff(diff);

  const issues = [];

  for (const fileObj of files) {
    for (const change of fileObj.changes) {
      const results = runRules(change, fileObj.file);
      issues.push(...results);
    }
  }

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