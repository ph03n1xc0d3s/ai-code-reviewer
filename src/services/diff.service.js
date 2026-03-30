export function parseDiff(diff) {
  console.log(diff, "parsing diff");
  const files = [];
  const lines = diff.split("\n");

  let currentFile = null;
  let currentLine = 0;

  for (const line of lines) {
    if (line.startsWith("diff --git")) {
      if (currentFile) files.push(currentFile);

      const fileName = line.split(" ")[2].replace("a/", "");
      currentFile = {
        file: fileName,
        changes: [],
      };
    }
    // capture line number from hunk
    else if (line.startsWith("@@")) {
      const match = line.match(/\+(\d+)/);
      if (match) {
        currentLine = parseInt(match[1], 10);
      }
    } else if (line.startsWith("+") && !line.startsWith("+++")) {
      currentFile?.changes.push({
        type: "added",
        content: line.substring(1),
        lineNumber: currentLine,
      });
      currentLine++;
    }
    // context lines (not removed)
    else if (!line.startsWith("-")) {
      currentLine++;
    }   
  }

  if (currentFile) files.push(currentFile);

  return files;
}