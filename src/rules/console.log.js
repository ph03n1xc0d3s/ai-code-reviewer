export function checkDebugLogs(change, file) {
  if (change.content.includes("console.log")) {
    return {
      type: "quality",
      severity: "low",
      file,
      line: "unknown",
      description: "Debug log in code",
      fix: "Remove before production",
    };
  }
}