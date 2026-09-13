import { UserModel, type IUserDocument } from "../../models/user.model.js";
import { encryptToken, decryptToken } from "../../lib/crypto.js";

interface GitHubUserProfile {
  id: number;
  login: string;
  name: string | null;
  email: string | null;
  avatar_url: string;
}

interface GitHubEmailEntry {
  email: string;
  primary: boolean;
  verified: boolean;
  visibility: string | null;
}

interface ParsedName {
  firstName: string;
  lastName: string;
}

function parseName(fullName: string | null): ParsedName {
  if (!fullName || fullName.trim() === "") {
    return { firstName: "GitHub", lastName: "User" };
  }

  const parts = fullName.trim().split(/\s+/);
  const firstName = parts[0] ?? "GitHub";
  const lastName = parts.slice(1).join(" ") || "User";

  return { firstName, lastName };
}

export async function fetchGitHubUser(accessToken: string): Promise<GitHubUserProfile> {
  const response = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
  }

  return response.json() as Promise<GitHubUserProfile>;
}

export async function fetchGitHubPrimaryEmail(accessToken: string): Promise<string | null> {
  try {
    const response = await fetch("https://api.github.com/user/emails", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });

    if (!response.ok) return null;

    const emails = (await response.json()) as GitHubEmailEntry[];
    const primary = emails.find((e) => e.primary && e.verified);
    return primary?.email ?? null;
  } catch {
    return null;
  }
}

export async function upsertUserFromGitHub(
  profile: GitHubUserProfile,
  accessToken: string
): Promise<IUserDocument> {
  const email = profile.email ?? (await fetchGitHubPrimaryEmail(accessToken));
  const { firstName, lastName } = parseName(profile.name);
  const encryptedToken = encryptToken(accessToken);

  const user = await UserModel.findOneAndUpdate(
    { githubId: String(profile.id) },
    {
      $set: {
        username: profile.login,
        firstName,
        lastName,
        email,
        avatarUrl: profile.avatar_url,
        githubToken: encryptedToken,
      },
    },
    { returnDocument: "after", upsert: true, setDefaultsOnInsert: true }
  );

  if (!user) {
    throw new Error("Failed to upsert user profile");
  }

  return user;
}

export async function getUserById(id: string) {
  const user = await UserModel.findById(id).select(
    "githubId username firstName lastName email avatarUrl createdAt updatedAt"
  );
  if (!user) return null;
  return user.toJSON();
}

export { decryptToken };
