/**
 * Shared state for the next/headers, next/navigation, next/cache and next/server mocks used by the
 * portal tests. Each test file wires these into vi.mock() and resets them in beforeEach.
 */
export type CookieOptions = { httpOnly?: boolean; secure?: boolean; sameSite?: string; path?: string; expires?: Date; maxAge?: number };

export const cookieJar = new Map<string, { value: string; options: CookieOptions }>();
export const requestHeaders = new Map<string, string>();
export const afterQueue: (() => Promise<void> | void)[] = [];

export const cookiesMock = async () => ({
  get: (name: string) => (cookieJar.has(name) ? { name, value: cookieJar.get(name)!.value } : undefined),
  set: (name: string, value: string, options: CookieOptions = {}) => {
    if (value === "" || options.maxAge === 0) cookieJar.delete(name);
    else cookieJar.set(name, { value, options });
  },
});

export const headersMock = async () => ({ get: (name: string) => requestHeaders.get(name.toLowerCase()) ?? null });

/** Mirrors Next: redirect() throws an error whose digest starts with NEXT_REDIRECT. */
export class RedirectSignal extends Error {
  digest: string;
  constructor(public url: string) {
    super(`NEXT_REDIRECT ${url}`);
    this.digest = `NEXT_REDIRECT;replace;${url};307;`;
  }
}
export const redirectMock = (url: string): never => {
  throw new RedirectSignal(url);
};

export async function runAfter() {
  while (afterQueue.length) await afterQueue.shift()!();
}

let ipCounter = 0;

/** Clears cookies/after-queue and gives each test its own client IP (the rate limiter is per IP and has no reset). */
export function resetNextMocks() {
  cookieJar.clear();
  requestHeaders.clear();
  afterQueue.length = 0;
  ipCounter += 1;
  requestHeaders.set("x-forwarded-for", `198.51.${Math.floor(ipCounter / 250)}.${ipCounter % 250}`);
  requestHeaders.set("user-agent", "vitest");
}

/** Captures the redirect target of an action that is expected to redirect. */
export async function expectRedirect(p: Promise<unknown>): Promise<string> {
  try {
    await p;
  } catch (err) {
    if (err instanceof RedirectSignal) return err.url;
    throw err;
  }
  throw new Error("Expected a redirect");
}
