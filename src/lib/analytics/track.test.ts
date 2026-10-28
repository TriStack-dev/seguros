import { afterEach, expect, it, vi } from "vitest";
import { track } from "./track";

afterEach(() => vi.unstubAllGlobals());
it("does nothing without a data layer", () => {
  expect(() => track("form_view", {})).not.toThrow();
});
it("sends only the allowlisted event parameters even with extra runtime properties", () => {
  const dataLayer: unknown[] = [];
  vi.stubGlobal("dataLayer", dataLayer);
  const params = {
    vehicle_type: "AUTO" as const,
    usage: "PARTICULAR" as const,
    request_number: "MS-000123",
    fullName: "Private",
    dni: "12345678",
    phone: "123",
    email: "private@example.com",
  };
  track("generate_lead", params);
  expect(dataLayer).toEqual([
    {
      event: "generate_lead",
      vehicle_type: "AUTO",
      usage: "PARTICULAR",
      request_number: "MS-000123",
    },
  ]);
});
it("cannot break the form when a tag throws", () => {
  vi.stubGlobal("dataLayer", {
    push() {
      throw new Error("tag failure");
    },
  });
  expect(() => track("form_start", { vehicle_type: "MOTO" })).not.toThrow();
});
// Type-only assertions are also checked by pnpm typecheck.
function checkTypes() {
  // @ts-expect-error Personal data is not an analytics parameter.
  track("form_view", { email: "private@example.com" });
  // @ts-expect-error Lead conversion requires its usage and request number.
  track("generate_lead", { vehicle_type: "AUTO" });
  // @ts-expect-error Unsupported event.
  track("submit", {});
}
void checkTypes;
