export function analyzePHP(ast, file) {
  const issues = [];

  function walk(node) {
    if (!node) return;

    if (node.kind === "bin") {
      if (
        node.left?.value?.includes?.("SELECT") &&
        node.right?.kind === "variable"
      ) {
        issues.push({
          type: "security",
          severity: "critical",
          file,
          description: "SQL Injection risk in PHP",
          fix: "Use prepared statements (PDO)",
        });
      }
    }

    for (const key in node) {
      const child = node[key];

      if (Array.isArray(child)) child.forEach(walk);
      else if (typeof child === "object") walk(child);
    }
  }

  walk(ast);

  return issues;
}