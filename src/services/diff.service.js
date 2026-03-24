export function parseDiff(diff) {
  const files = [];
  const lines = diff.split("\n");

  let currentFile = null;

  for (const line of lines) {
    if (line.startsWith("diff --git")) {
      if (currentFile) files.push(currentFile);

      const fileName = line.split(" ")[2].replace("a/", "");
      currentFile = {
        file: fileName,
        changes: [],
      };
    } else if (line.startsWith("+") && !line.startsWith("+++")) {
      currentFile?.changes.push({
        type: "added",
        content: line.substring(1),
      });
    }
  }

  if (currentFile) files.push(currentFile);

  return files;
}