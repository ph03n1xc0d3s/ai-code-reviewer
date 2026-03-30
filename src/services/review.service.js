import { parseDiff } from "./diff.service.js";
import { analyzeChunk } from "./ai.service.js";
import { chunkDiff } from "./chunk.service.js";
import { runRules } from "../rules/index.js";
import { parseJS } from "../ast/jsParser.js";
import { analyzeJS } from "../ast/jsAnalyzer.js";
import { parsePHP } from "../ast/phpParser.js";
import { analyzePHP } from "../ast/phpAnalyzer.js";
import { PROMPT_INJECTION_PATTERNS } from "../config/security/prompt-injection.js";

export async function processReview(diff) {
  const issues = [];
  const chunks = null; // Disable chunking for now, focus on rule-based and AST analysis
  let sanitizedDiff = sanitizeDiff(diff);
  if (chunks == null) {
    sanitizedDiff ? console.warn("Fallback to Static Rules due to no AI api key") : console.warn("Using Static Rules due to chunking disabled");
    //   const chunks = chunkDiff(diff);
    const files = parseDiff(diff);

    const password = "password123"; // Example of a hardcoded password to detect

    for (const fileObj of files) {
      // If it's a JS file, do AST analysis
      if (fileObj.file.endsWith(".js")) {
        let code = "";
        let lineMap = [];

        // preserve line alignment
        for (const change of fileObj.changes) {
          code += change.content + "\n";
          lineMap.push(change.lineNumber);
        }

        const ast = parseJS(code);

        if (ast) {
          const astIssues = analyzeJS(ast, fileObj.file, lineMap);
          issues.push(...astIssues);
        }
      }

      // If it's a PHP file, do AST analysis
      if (fileObj.file.endsWith(".php")) {
        const code = fileObj.changes.map((c) => c.content).join("\n");

        const ast = parsePHP(code);

        if (ast) {
          const astIssues = analyzePHP(ast, fileObj.file);
          issues.push(...astIssues);
        }
      }

      // Fallback to rule-based checks for all files
      // for (const change of fileObj.changes) {
      //   const results = runRules(change, fileObj.file);
      //   issues.push(...results);
      // }
    }
  } else if (sanitizedDiff == true && chunks != null) {
    const results = await Promise.all(
      chunks.map((chunk) => analyzeChunk(chunk)),
    );

    const merged = results.flatMap((r) => r.issues);
  } else {
    console.warn("No chunks to analyze");
  }

  return {
    totalIssues: issues.length,
    issues: dedupeIssues(issues),
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

function sanitizeDiff(diff) {
  let normalized = normalize(diff);
  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    if (pattern.test(normalized)) {
      return console.log('⚠️ Potential prompt injection detected, exiting before review');
    }
  }
  return true;
}

// Normalizes unique text injections that could be used to bypass AI detection, such as zero-width characters, homoglyphs, or obfuscated patterns.
function normalize(diff){
    return diff
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[^a-z0-9 ]/g, '');
}