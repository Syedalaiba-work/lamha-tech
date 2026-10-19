import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { can } from "@/lib/server/rbac";

// Controllable Resend double (same pattern as email.test.ts).
const sendMock = vi.fn();
vi.mock("resend", () => ({
  Resend: class {
    emails = { send: (...args: unknown[]) => sendMock(...args) };
  },
}));
vi.mock("@/lib/server/db", () => ({ isDatabaseConfigured: () => false, getPrisma: () => { throw new Error("no db in tests"); } }));
vi.mock("@/lib/server/audit", () => ({ audit: async () => undefined }));

const ENV = { ...process.env };
beforeEach(() => {
  vi.resetModules();
  sendMock.mockReset();
  process.env = { ...ENV };
  delete process.env.EMAIL_API_KEY;
  delete process.env.RESEND_API_KEY;
  delete process.env.EMAIL_FROM;
  delete process.env.EMAIL_TO;
  delete process.env.EMAIL_REPLY_TO;
  process.env.NEXT_PUBLIC_SITE_URL = "https://lamhatechnologies.com";
});
afterEach(() => {
  process.env = ENV;
});

describe("reply permission", () => {
  it("lets Staff and above send replies, not Viewers", () => {
    expect(can("VIEWER", "reply:send")).toBe(false);
    expect(can("STAFF", "reply:send")).toBe(true);
    expect(can("MANAGER", "reply:send")).toBe(true);
    expect(can("OWNER", "reply:send")).toBe(true);
  });
});

describe("reply email", () => {
  it("renders the staff message with a signature and escapes HTML", async () => {
    const { buildReplyEmail } = await import("@/lib/server/reply");
    const mail = buildReplyEmail({ subject: "Re: Inventory portal", body: "Hello Ayesha,\n\nThanks for reaching out <b>today</b>.", senderName: "Maira Almas", referenceId: "abc-123" });
    expect(mail.subject).toBe("Re: Inventory portal");
    expect(mail.text).toContain("Hello Ayesha,");
    expect(mail.text).toContain("Maira Almas\nLAMHA Technologies\nhttps://lamhatechnologies.com");
    expect(mail.html).toContain("&lt;b&gt;today&lt;/b&gt;");
    expect(mail.html).not.toContain("<b>today</b>");
    expect(mail.html).toContain("Maira Almas");
    expect(mail.html).toContain("Reference abc-123");
  });

  it("routes the recipient's answer to EMAIL_REPLY_TO, then EMAIL_TO, then the published company email", async () => {
    process.env.EMAIL_TO = "owner@example.com, second@example.com";
    let mod = await import("@/lib/server/reply");
    expect(mod.replyToAddress()).toBe("owner@example.com");

    vi.resetModules();
    process.env.EMAIL_REPLY_TO = "hello@lamhatechnologies.com";
    mod = await import("@/lib/server/reply");
    expect(mod.replyToAddress()).toBe("hello@lamhatechnologies.com");

    vi.resetModules();
    delete process.env.EMAIL_REPLY_TO;
    delete process.env.EMAIL_TO;
    mod = await import("@/lib/server/reply");
    expect(mod.replyToAddress()).toBe("lamhatechnologies@gmail.com");
  });

  it("explains a missing API key without exposing anything sensitive", async () => {
    const { describeSendFailure } = await import("@/lib/server/reply");
    expect(describeSendFailure("email_not_configured")).toMatch(/EMAIL_API_KEY/);
    expect(describeSendFailure("validation_error: domain not verified")).toContain("domain not verified");
  });

  it("sends to the explicit recipient even when EMAIL_TO is unset", async () => {
    process.env.EMAIL_API_KEY = "re_test";
    sendMock.mockResolvedValue({ data: { id: "msg_1" }, error: null });
    const { sendEmail } = await import("@/lib/server/email");
    const result = await sendEmail({ to: ["ayesha@example.com"], subject: "Re: hi", text: "t", html: "<p>t</p>", replyTo: "owner@example.com", idempotencyKey: "reply:1" });
    expect(result.ok).toBe(true);
    expect(sendMock).toHaveBeenCalledTimes(1);
    const [payload, options] = sendMock.mock.calls[0] as [Record<string, unknown>, Record<string, unknown>];
    expect(payload.to).toEqual(["ayesha@example.com"]);
    expect(payload.replyTo).toBe("owner@example.com");
    expect(options.idempotencyKey).toBe("reply:1");
  });
});
