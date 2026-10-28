import { afterEach, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import { verifyTurnstile } from "./turnstile";
afterEach(() => vi.useRealTimers());
it("posts the token and server secret to Siteverify, without IP or PII", async () => {
  const fetcher = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ success: true }) });
  expect(await verifyTurnstile("token", { secret: "secret", fetcher })).toBe(true);
  expect(fetcher).toHaveBeenCalledWith(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    expect.objectContaining({
      method: "POST",
      body: expect.any(URLSearchParams),
      signal: expect.any(AbortSignal),
    }),
  );
  expect(fetcher.mock.calls[0]?.[1]?.body.toString()).toBe("secret=secret&response=token");
});
it.each([undefined, null, "", " ", 42, "a".repeat(2049)])(
  "rejects invalid tokens without network",
  async (token) => {
    const fetcher = vi.fn();
    expect(await verifyTurnstile(token, { secret: "secret", fetcher })).toBe(false);
    expect(fetcher).not.toHaveBeenCalled();
  },
);
it("fails closed without configured secret", async () => {
  const fetcher = vi.fn();
  expect(await verifyTurnstile("token", { secret: "", fetcher })).toBe(false);
  expect(fetcher).not.toHaveBeenCalled();
});
it.each([{ success: false }, { success: "true" }, {}, null])(
  "rejects invalid Siteverify response %j",
  async (body) => {
    const fetcher = vi.fn().mockResolvedValue({ ok: true, json: async () => body });
    expect(await verifyTurnstile("token", { secret: "secret", fetcher })).toBe(false);
  },
);
it("rejects HTTP/network/JSON failures", async () => {
  for (const response of [
    new Response(null, { status: 500 }),
    new Response("not-json", { status: 200 }),
  ]) {
    expect(
      await verifyTurnstile("token", {
        secret: "secret",
        fetcher: vi.fn(async () => response),
      }),
    ).toBe(false);
  }
  expect(
    await verifyTurnstile("token", {
      secret: "secret",
      fetcher: vi.fn().mockRejectedValue(new Error("offline")),
    }),
  ).toBe(false);
});
it("aborts a stalled request within the timeout", async () => {
  vi.useFakeTimers();
  const fetcher = vi.fn(
    (_url: unknown, options?: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        options?.signal?.addEventListener("abort", () => reject(new Error("aborted")));
      }),
  );
  const pending = verifyTurnstile("token", { secret: "secret", fetcher });
  await vi.advanceTimersByTimeAsync(5000);
  expect(await pending).toBe(false);
});
