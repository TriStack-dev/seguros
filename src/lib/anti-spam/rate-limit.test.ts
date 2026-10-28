import { createHash } from "node:crypto";
import { beforeEach, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
const { transaction, count, create, deleteMany } = vi.hoisted(() => ({
  transaction: vi.fn(),
  count: vi.fn(),
  create: vi.fn(),
  deleteMany: vi.fn(),
}));
vi.mock("@/lib/db", () => ({
  db: { $transaction: transaction, submissionAttempt: { deleteMany } },
}));
import { checkRateLimit, type AttemptTransaction } from "./rate-limit";
const now = new Date("2026-10-28T12:00:00Z");
const deps = () => ({ salt: "unit-test-salt", now: () => now, random: () => 1 });
beforeEach(() => {
  vi.resetAllMocks();
  count.mockResolvedValue(0);
  create.mockResolvedValue({});
  transaction.mockImplementation(async (fn: (tx: AttemptTransaction) => Promise<boolean>) =>
    fn({ submissionAttempt: { count, create } }),
  );
});
it("allows five attempts and rejects the sixth without recording it", async () => {
  let attempts = 0;
  count.mockImplementation(async () => attempts);
  create.mockImplementation(async () => {
    attempts++;
  });
  for (let n = 0; n < 5; n++)
    expect(await checkRateLimit("203.0.113.8, 192.0.2.1", deps())).toBe(true);
  expect(await checkRateLimit("203.0.113.8", deps())).toBe(false);
  expect(attempts).toBe(5);
  expect(create).toHaveBeenCalledTimes(5);
});
it("persists only a salted hash and counts the last hour", async () => {
  await checkRateLimit(" 203.0.113.8 , 192.0.2.1", deps());
  const ipHash = createHash("sha256").update("203.0.113.8unit-test-salt").digest("hex");
  expect(count).toHaveBeenCalledWith({
    where: { ipHash, createdAt: { gt: new Date("2026-10-28T11:00:00Z") } },
  });
  expect(create).toHaveBeenCalledWith({ data: { ipHash, createdAt: now } });
  expect(transaction).toHaveBeenCalledWith(expect.any(Function), {
    isolationLevel: "Serializable",
  });
  expect(JSON.stringify(create.mock.calls)).not.toContain("203.0.113.8");
});
it.each([null, "", "garbage", ", 203.0.113.8"])(
  "rejects missing or invalid IP %s without writes",
  async (ip) => {
    await expect(checkRateLimit(ip, deps())).rejects.toThrow();
    expect(transaction).not.toHaveBeenCalled();
  },
);
it("fails closed without a salt", async () => {
  await expect(checkRateLimit("203.0.113.8", { ...deps(), salt: "" })).rejects.toThrow();
  expect(transaction).not.toHaveBeenCalled();
});
it("uses one hash for equivalent IPv6 forms", async () => {
  await checkRateLimit("2001:db8::1", deps());
  await checkRateLimit("2001:0db8:0000:0000:0000:0000:0000:0001", deps());
  expect(create.mock.calls[0]).toEqual(create.mock.calls[1]);
});
it("retries serialization conflicts, but not unrelated failures", async () => {
  transaction.mockRejectedValueOnce({ code: "P2034" });
  expect(await checkRateLimit("203.0.113.8", deps())).toBe(true);
  expect(transaction).toHaveBeenCalledTimes(2);
  transaction.mockRejectedValueOnce(new Error("offline"));
  await expect(checkRateLimit("203.0.113.8", deps())).rejects.toThrow("offline");
  expect(transaction).toHaveBeenCalledTimes(3);
});
it("bounds serialization retries and fails closed", async () => {
  transaction.mockRejectedValue({ code: "P2034" });
  await expect(checkRateLimit("203.0.113.8", deps())).rejects.toBeDefined();
  expect(transaction).toHaveBeenCalledTimes(3);
});
it("opportunistically deletes only attempts older than seven days", async () => {
  await checkRateLimit("203.0.113.8", { ...deps(), random: () => 0 });
  expect(deleteMany).toHaveBeenCalledWith({
    where: { createdAt: { lt: new Date("2026-10-21T12:00:00Z") } },
  });
});
it("does not fail a permitted attempt when cleanup fails", async () => {
  deleteMany.mockRejectedValueOnce(new Error("cleanup failure"));
  expect(await checkRateLimit("203.0.113.8", { ...deps(), random: () => 0 })).toBe(true);
});
