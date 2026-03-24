export function checkNPlusOne(change, file) {
  if (
    change.content.includes("for") &&
    change.content.includes("await")
  ) {
    return {
      type: "performance",
      severity: "high",
      file,
      line: "unknown",
      description: "Possible N+1 query pattern",
      fix: "Batch queries or use joins",
    };
  }
}