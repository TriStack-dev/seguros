import { describe, expect, it } from "vitest";
import { DEFAULT_ADMIN_REDIRECT, safeAdminRedirect } from "./safe-redirect";

describe("safeAdminRedirect", () => {
  it("acepta rutas internas del panel", () => {
    expect(safeAdminRedirect("/admin/leads")).toBe("/admin/leads");
    expect(safeAdminRedirect("/admin/leads?page=2#x")).toBe("/admin/leads?page=2#x");
    expect(safeAdminRedirect("/admin")).toBe("/admin");
  });

  it("rechaza destinos externos o ajenos al panel", () => {
    for (const bad of [
      "https://evil.com",
      "//evil.com",
      "/\\evil.com",
      "/admin\\evil",
      "/administrador",
      "/privacidad",
      "javascript:alert(1)",
      "/admin/\nfoo",
      "",
    ]) {
      expect(safeAdminRedirect(bad)).toBe(DEFAULT_ADMIN_REDIRECT);
    }
  });

  it("usa el fallback cuando falta el valor", () => {
    expect(safeAdminRedirect(null)).toBe(DEFAULT_ADMIN_REDIRECT);
    expect(safeAdminRedirect(undefined, "/admin/login")).toBe("/admin/login");
  });
});
