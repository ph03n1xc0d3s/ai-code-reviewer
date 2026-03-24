import { getOctokit } from "../config/github.js";
import { processReview } from "./review.service.js";

export async function handlePR(payload) {
  const action = payload.action;

  // only act on meaningful events
  if (!["opened", "synchronize", "reopened"].includes(action)) return;

  const owner = payload.repository.owner.login;
  const repo = payload.repository.name;
  const pull_number = payload.pull_request.number;

  const octokit = await getOctokit();

  console.log(`Processing PR #${pull_number} in ${owner}/${repo}`);

  // 🔥 fetch diff
  const { data: diff } = await octokit.request(
    "GET /repos/{owner}/{repo}/pulls/{pull_number}",
    {
      owner,
      repo,
      pull_number,
      headers: {
        accept: "application/vnd.github.v3.diff",
      },
    }
  );

  console.log("Diff fetched");

  // 🔥 run your analyzer
  const result = await processReview(diff);

  console.log("Analysis complete:", result.totalIssues);

  // 🔥 post result
  await postComment(octokit, owner, repo, pull_number, result);
}


async function postComment(octokit, owner, repo, pull_number, result) {
  if (!result.issues.length) {
    console.log("No issues found");
    return;
  }

  const body = formatComment(result);

  await octokit.issues.createComment({
    owner,
    repo,
    issue_number: pull_number,
    body,
  });

  console.log("Comment posted on PR");
}

function formatComment(result) {
  let text = `## 🤖 Code Review Report\n\n`;
  text += `**Total Issues:** ${result.totalIssues}\n\n`;

  for (const issue of result.issues) {
    text += `### ${getEmoji(issue.severity)} ${issue.type.toUpperCase()}\n`;
    text += `- **File:** ${issue.file}\n`;
    text += `- **File:** ${issue.file}:${issue.line}\n`;
    text += `- **Issue:** ${issue.description}\n`;
    text += `- **Fix:** ${issue.fix}\n\n`;
  }

  return text;
}

function getEmoji(severity) {
  return {
    critical: "🚨",
    high: "⚠️",
    medium: "🔍",
    low: "ℹ️",
  }[severity] || "❓";
}