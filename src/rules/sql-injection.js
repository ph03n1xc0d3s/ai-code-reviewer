export function checkSQLInjection(change, file) {
  if (
    change.content.includes("SELECT") &&
    change.content.includes("+")
  ) {
    return {
      type: "security",
      severity: "critical",
      file,
      line: "unknown",
      description: "SQL Injection via string concatenation",
      fix: "Use parameterized queries / ORM bindings",
    };
  }
}