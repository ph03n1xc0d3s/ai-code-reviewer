export function analyzeJS(ast, file, lineMap = []) {
  const issues = [];

  function resolveLine(loc, lineMap) {
    if (!loc || !Array.isArray(lineMap)) return "unknown";

    const index = loc - 1;

    if (index >= 0 && index < lineMap.length) {
      return lineMap[index] ?? "unknown";
    }

    return "unknown";
  }

  function walk(node) {
    // Skip invalid nodes
    if (!node || typeof node !== "object") return;

    // Only process real AST nodes
    if (!node.type || typeof node.type !== "string") return;

    // get AST line
    const loc = node.loc?.start?.line;
    const actualLine = resolveLine(loc, lineMap);

    // Detect SQL Injection pattern
    if (node.type === "BinaryExpression" && node.operator === "+") {
      if (
        node.left?.value?.includes?.("SELECT") &&
        node.right?.type === "Identifier"
      ) {
        issues.push({
          type: "security",
          severity: "critical",
          file,
          line: actualLine,
          description: "SQL Injection via string concatenation",
          fix: "Use parameterized queries",
        });
      }
    }

    // Detect console.log
    if (node.type === "CallExpression") {
      if (
        node.callee?.object?.name === "console" &&
        node.callee?.property?.name === "log"
      ) {
        issues.push({
          type: "quality",
          severity: "low",
          file,
          line: actualLine,
          description: "console.log statement found",
          fix: "Remove debug logs",
        });
      }
    }

    // recursive walk
    for (const key in node) {
      const child = node[key];

      if (Array.isArray(child)) {
        child.forEach((c) => {
          if (c && typeof c === "object" && c.type) walk(c);
        });
      } else if (child && typeof child === "object" && child.type) {
        walk(child);
      }
    }
  }

  walk(ast);

  return issues;
}