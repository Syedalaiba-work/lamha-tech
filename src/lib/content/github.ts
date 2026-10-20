import { normaliseUrl } from "./schema";

/**
 * Confirms a GitHub profile or repository exists and is public before it is published.
 * Uses the unauthenticated public API (no token, nothing secret). Network failures fail closed:
 * an unverifiable URL is rejected, never published. The canonical html_url (correct casing) is returned.
 */
export type GithubCheck = { ok: true; url: string } | { ok: false; message: string };

type FetchLike = (input: string, init?: RequestInit) => Promise<Pick<Response, "status" | "ok" | "json">>;

const API = "https://api.github.com";

async function getJson(path: string, fetchImpl: FetchLike): Promise<{ status: number; body: Record<string, unknown> | null }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6000);
  try {
    const res = await fetchImpl(`${API}${path}`, {
      headers: { accept: "application/vnd.github+json", "user-agent": "lamha-website-portal" },
      signal: controller.signal,
      cache: "no-store",
    });
    const body = res.ok ? ((await res.json()) as Record<string, unknown>) : null;
    return { status: res.status, body };
  } finally {
    clearTimeout(timer);
  }
}

export async function verifyGithubUrl(raw: string, fetchImpl: FetchLike = fetch): Promise<GithubCheck> {
  const repo = normaliseUrl(raw, "githubRepo");
  const profile = repo ? null : normaliseUrl(raw, "githubProfile");
  if (!repo && !profile) return { ok: false, message: "Not a GitHub profile or repository URL." };
  const [, , , login, name] = (repo ?? profile)!.split("/");
  try {
    const { status, body } = await getJson(repo ? `/repos/${login}/${name}` : `/users/${login}`, fetchImpl);
    if (status === 404) return { ok: false, message: `${repo ?? profile} does not exist on GitHub (or is private).` };
    if (status === 403 || status === 429) return { ok: false, message: "GitHub's rate limit was reached, so the link could not be verified. Try again in a few minutes." };
    if (!body || status !== 200) return { ok: false, message: `GitHub could not confirm ${repo ?? profile} (status ${status}). Try again shortly.` };
    if (repo && body.private !== false) return { ok: false, message: "That repository is private; only public repositories can be linked." };
    const htmlUrl = typeof body.html_url === "string" ? body.html_url : null;
    const canonical = htmlUrl ? normaliseUrl(htmlUrl, repo ? "githubRepo" : "githubProfile") : null;
    return { ok: true, url: canonical ?? (repo ?? profile)! };
  } catch {
    return { ok: false, message: "GitHub could not be reached, so the link was not saved. Try again shortly." };
  }
}
