import "server-only";
import { createHash } from "node:crypto";
import { isIP } from "node:net";
import { db } from "@/lib/db";
import {
  ATTEMPT_RETENTION_MS,
  ATTEMPT_WINDOW_MS,
  CLEANUP_PROBABILITY,
  SUBMISSIONS_PER_HOUR,
} from "./constants";

export type AttemptTransaction = {
  submissionAttempt: {
    count(args: { where: { ipHash: string; createdAt: { gt: Date } } }): Promise<number>;
    create(args: { data: { ipHash: string; createdAt: Date } }): Promise<unknown>;
  };
};
type Dependencies = {
  salt?: string;
  now?: () => Date;
  random?: () => number;
  transaction?: (run: (tx: AttemptTransaction) => Promise<boolean>) => Promise<boolean>;
  cleanup?: (before: Date) => Promise<unknown>;
};

export async function checkRateLimit(
  forwardedFor: string | null,
  dependencies: Dependencies = {},
): Promise<boolean> {
  const ip = forwardedFor?.split(",")[0]?.trim();
  const salt = dependencies.salt ?? process.env.IP_HASH_SALT;
  if (!ip || !isIP(ip) || !salt?.trim()) throw new Error("Anti-spam configuration unavailable");
  // IPv6 textual variants must share one bucket. Never persist or log the raw IP.
  const normalizedIp = isIP(ip) === 6 ? new URL(`http://[${ip}]`).hostname.slice(1, -1) : ip;
  const ipHash = createHash("sha256")
    .update(normalizedIp + salt)
    .digest("hex");
  const runTransaction =
    dependencies.transaction ??
    ((run: (tx: AttemptTransaction) => Promise<boolean>) =>
      db.$transaction(run, { isolationLevel: "Serializable" }));
  let allowed = false;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      allowed = await runTransaction(async (tx) => {
        // Recalculate the rolling window after a serialization retry.
        const now = (dependencies.now ?? (() => new Date()))();
        const count = await tx.submissionAttempt.count({
          where: { ipHash, createdAt: { gt: new Date(now.getTime() - ATTEMPT_WINDOW_MS) } },
        });
        if (count >= SUBMISSIONS_PER_HOUR) return false;
        await tx.submissionAttempt.create({ data: { ipHash, createdAt: now } });
        return true;
      });
      break;
    } catch (error) {
      if (
        attempt === 2 ||
        typeof error !== "object" ||
        error === null ||
        !("code" in error) ||
        error.code !== "P2034"
      )
        throw error;
    }
  }
  if ((dependencies.random ?? Math.random)() < CLEANUP_PROBABILITY) {
    const now = (dependencies.now ?? (() => new Date()))();
    const before = new Date(now.getTime() - ATTEMPT_RETENTION_MS);
    try {
      await (
        dependencies.cleanup ??
        ((date) =>
          db.submissionAttempt.deleteMany({
            where: { createdAt: { lt: date } },
          }))
      )(before);
    } catch {
      // Best-effort retention must not change a committed admission decision.
    }
  }
  return allowed;
}
