import { beforeEach, describe, expect, it, vi } from "vitest";

const updateMany = vi.hoisted(() => vi.fn());
vi.mock("@/lib/db", () => ({ db: { lead: { updateMany } } }));

import { POST } from "./route";

const id = "550e8400-e29b-41d4-a716-446655440000";
const context = { params: Promise.resolve({ id }) };
const request = (headers = new Headers({ origin: "https://example.test" })) =>
  new Request("https://example.test/api/leads/whatsapp", { method: "POST", headers });

describe("WhatsApp click endpoint", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    updateMany.mockResolvedValue({ count: 1 });
  });

  it("atomically sets the click timestamp once and responds 204", async () => {
    const response = await POST(
      request(new Headers({ origin: "https://example.test", "sec-fetch-site": "same-origin" })),
      context,
    );
    expect(response.status).toBe(204);
    expect(updateMany).toHaveBeenCalledWith({
      where: { id, whatsappClickedAt: null },
      data: { whatsappClickedAt: expect.any(Date) },
    });
  });

  it("returns 204 without querying for an invalid UUID", async () => {
    expect((await POST(request(), { params: Promise.resolve({ id: "invalid" }) })).status).toBe(
      204,
    );
    expect(updateMany).not.toHaveBeenCalled();
  });

  it("returns 204 and suppresses database failures", async () => {
    updateMany.mockRejectedValueOnce(new Error("offline"));
    expect((await POST(request(), context)).status).toBe(204);
  });

  it("does not process cross-site beacons", async () => {
    expect(
      (
        await POST(
          request(new Headers({ origin: "https://attacker.test", "sec-fetch-site": "cross-site" })),
          context,
        )
      ).status,
    ).toBe(204);
    expect(updateMany).not.toHaveBeenCalled();
  });
});

it("does not mutate when no same-origin evidence is present", async () => {
  updateMany.mockClear();
  expect((await POST(request(new Headers()), context)).status).toBe(204);
  expect(updateMany).not.toHaveBeenCalled();
});
