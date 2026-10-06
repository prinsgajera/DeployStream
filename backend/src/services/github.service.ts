import { env } from "../config/env.js";

const GITHUB_API_URL = "https://api.github.com";
const WEBHOOK_PATH = "/api/webhooks/github";

interface GitHubHookResponse {
  id: number;
}

function githubHeaders(accessToken: string): Record<string, string> {
  return {
    Authorization: `Bearer ${accessToken}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "Content-Type": "application/json",
  };
}

export async function createPushWebhook(
  accessToken: string,
  repoFullName: string
): Promise<string | null> {
  if (!env.PUBLIC_API_URL) return null;

  const response = await fetch(`${GITHUB_API_URL}/repos/${repoFullName}/hooks`, {
    method: "POST",
    headers: githubHeaders(accessToken),
    body: JSON.stringify({
      name: "web",
      active: true,
      events: ["push"],
      config: {
        url: `${env.PUBLIC_API_URL}${WEBHOOK_PATH}`,
        content_type: "json",
        secret: env.GITHUB_WEBHOOK_SECRET,
        insecure_ssl: "0",
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`GitHub webhook creation failed: ${response.status} ${response.statusText}`);
  }

  const hook = (await response.json()) as GitHubHookResponse;
  return String(hook.id);
}

export async function deleteWebhook(
  accessToken: string,
  repoFullName: string,
  webhookId: string
): Promise<void> {
  const response = await fetch(`${GITHUB_API_URL}/repos/${repoFullName}/hooks/${webhookId}`, {
    method: "DELETE",
    headers: githubHeaders(accessToken),
  });

  if (!response.ok && response.status !== 404) {
    throw new Error(`GitHub webhook deletion failed: ${response.status} ${response.statusText}`);
  }
}
