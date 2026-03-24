import { Octokit } from "@octokit/rest";
import { createAppAuth } from "@octokit/auth-app";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Resolve private key path safely
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const privateKeyPath = path.join(__dirname, "../../private-key.pem");

// Lazy cache (avoid recreating client every request)
let octokitInstance = null;

export async function getOctokit() {
  if (octokitInstance) return octokitInstance;

  const {
    GITHUB_APP_ID,
    GITHUB_INSTALLATION_ID,
  } = process.env;

  if (!GITHUB_APP_ID || !GITHUB_INSTALLATION_ID) {
    throw new Error("Missing GitHub App credentials in env");
  }

  console.log("Looking for key at:", privateKeyPath); // debug

  // Read private key
  let privateKey;
  try {
    privateKey = fs.readFileSync(privateKeyPath, "utf8");
  } catch (err) {
    throw new Error("private-key.pem not found or unreadable");
  }

  // Create authenticated Octokit client
  octokitInstance = new Octokit({
    authStrategy: createAppAuth,
    auth: {
      appId: GITHUB_APP_ID,
      privateKey,
      installationId: GITHUB_INSTALLATION_ID,
    },
  });

  return octokitInstance;
}