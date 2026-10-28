import "server-only";
import { z } from "zod";
const tokenSchema = z.string().trim().min(1).max(2048);
const responseSchema = z.object({ success: z.boolean() });
const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const TIMEOUT_MS = 5000;

export async function verifyTurnstile(
  token: unknown,
  {
    secret = process.env.TURNSTILE_SECRET_KEY,
    fetcher = fetch,
  }: {
    secret?: string;
    fetcher?: typeof fetch;
  } = {},
): Promise<boolean> {
  const parsed = tokenSchema.safeParse(token);
  if (!parsed.success || !secret?.trim()) return false;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const response = await fetcher(SITEVERIFY_URL, {
      method: "POST",
      body: new URLSearchParams({ secret, response: parsed.data }),
      signal: controller.signal,
      cache: "no-store",
    });
    if (!response.ok) return false;
    const result = responseSchema.safeParse(await response.json());
    return result.success && result.data.success;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}
