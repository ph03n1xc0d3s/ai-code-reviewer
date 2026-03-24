export function analyzeJS(ast, file, lineMap = []) {
  const issues = [];
  const declared = new Set();
  const used = new Set();
  const seen = new Set();

  function resolveLine(loc, lineMap) {
    if (!loc || !Array.isArray(lineMap)) return "unknown";

    const index = loc - 1;

    if (index >= 0 && index < lineMap.length) {
      return lineMap[index] ?? "unknown";
    }

    return "unknown";
  }

  function addIssue(issue) {
    const key = `${issue.file}:${issue.line}:${issue.description}`;
    if (!seen.has(key)) {
      seen.add(key);
      issues.push(issue);
    }
  }

  function walk(node) {
    // Skip invalid nodes
    if (!node || typeof node !== "object") return;
    if (!node.loc) return;
    // Only process real AST nodes
    if (!node.type || typeof node.type !== "string") return;

    // get AST line
    const loc = node.loc?.start?.line;
    const actualLine = resolveLine(loc, lineMap);

    if (node.type === "VariableDeclarator") {
      declared.add(node.id.name);
    }

    if (node.type === "Identifier") {
      used.add(node.name);
    }

    // Detect SQL Injection pattern
    if (node.type === "TemplateLiteral") {
      const hasSQL = node.quasis.some((q) =>
        q.value.raw.toUpperCase().includes("SELECT"),
      );

      if (hasSQL && node.expressions.length > 0) {
        addIssue({
          type: "security",
          severity: "critical",
          file,
          line: actualLine,
          description: "SQL Injection via template literal",
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
        addIssue({
          type: "quality",
          severity: "low",
          file,
          line: actualLine,
          description: "console.log statement found",
          fix: "Remove debug logs",
        });
      }
    }

    if (
      node.type === "VariableDeclarator" &&
      node.init?.type === "StringLiteral"
    ) {
      const val = node.init.value;

      if (/api[_-]?key|secret|token|password/i.test(node.id.name)) {
        addIssue({
          type: "security",
          severity: "critical",
          file,
          line: actualLine,
          description: "Hardcoded secret detected",
          fix: "Use environment variables",
        });
      }
    }

    const dangerousFns = ["eval", "Function", "setTimeout", "setInterval"];

    if (node.type === "CallExpression") {
      const fn = getFunctionName(node);

      if (dangerousFns.includes(fn)) {
        addIssue({
          type: "security",
          severity: "high",
          file,
          line: actualLine,
          description: `Dangerous function usage: ${fn}`,
          fix: "Avoid dynamic execution",
        });
      }
    }

    if (node.type === "CallExpression") {
      const fn = getFunctionName(node);

      if (["fetch", "axios", "http", "https"].includes(fn)) {
        if (node.arguments?.[0]?.type === "Identifier") {
          addIssue({
            type: "security",
            severity: "high",
            file,
            line: actualLine,
            description: "Potential SSRF via user-controlled URL",
            fix: "Validate and whitelist URLs",
          });
        }
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

  for (const v of declared) {
    if (!used.has(v)) {
      addIssue({
        type: "quality",
        severity: "low",
        file,
        description: `Unused variable: ${v}`,
      });
    }
  }

  return issues;
}

function getFunctionName(node) {
  if (node.callee?.type === "Identifier") {
    return node.callee.name;
  }
  if (node.callee?.type === "MemberExpression") {
    return node.callee.property?.name;
  }
  return null;
}