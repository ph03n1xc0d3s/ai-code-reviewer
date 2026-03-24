export function analyzeJS(ast, file, lineMap) {
  const issues = [];

  function walk(node) {
    if (!node) return;

    // get AST line
    const loc = node.loc?.start?.line;
    const actualLine = lineMap[loc - 1] || "unknown";

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
          description: "console.log found",
          fix: "Remove debug logs",
        });
      }
    }

    // recursive walk
    for (const key in node) {
      const child = node[key];

      if (Array.isArray(child)) {
        child.forEach(walk);
      } else if (typeof child === "object" && child !== null) {
        walk(child);
      }
    }
  }

  walk(ast);

  return issues;
}