export function chunkDiff(diff, maxSize = 2000) {
  const chunks = [];
  let current = "";

  for (const line of diff.split("\n")) {
    if ((current + line).length > maxSize) {
      chunks.push(current);
      current = "";
    }
    current += line + "\n";
  }

  if (current) chunks.push(current);
  return chunks;
}