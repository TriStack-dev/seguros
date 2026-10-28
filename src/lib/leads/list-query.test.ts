import { describe, expect, it } from "vitest";
import { buildLeadDetailHref, buildLeadListBackQuery, buildLeadsBackHref } from "./list-query";

describe("buildLeadListBackQuery", () => {
  it("keeps the active filters and omits the first page", () => {
    const query = buildLeadListBackQuery({
      search: "MS-000123",
      from: "2026-10-01",
      to: "2026-10-31",
      vehicleType: "AUTO",
      status: "NEW",
      page: 1,
    });
    const params = new URLSearchParams(query);

    expect(params.get("search")).toBe("MS-000123");
    expect(params.get("from")).toBe("2026-10-01");
    expect(params.get("to")).toBe("2026-10-31");
    expect(params.get("vehicleType")).toBe("AUTO");
    expect(params.get("status")).toBe("NEW");
    expect(params.has("page")).toBe(false);
  });

  it("keeps the current page when it is not the first one", () => {
    expect(buildLeadListBackQuery({ page: 3 })).toBe("page=3");
  });

  it("drops values outside the known filters", () => {
    expect(buildLeadListBackQuery({ vehicleType: "BARCO", status: "DUDOSO" })).toBe("");
  });
});

describe("buildLeadDetailHref", () => {
  it("carries the filters as a back parameter", () => {
    expect(buildLeadDetailHref("abc", "status=NEW&page=2")).toBe(
      "/admin/leads/abc?back=status%3DNEW%26page%3D2",
    );
  });

  it("omits the parameter when there are no filters", () => {
    expect(buildLeadDetailHref("abc", "")).toBe("/admin/leads/abc");
  });
});

describe("buildLeadsBackHref", () => {
  it("rebuilds the list URL with the known filters only", () => {
    const href = buildLeadsBackHref("search=Juan&status=QUOTED&page=2&evil=https://example.com");
    expect(href).toBe("/admin/leads?search=Juan&status=QUOTED&page=2");
  });

  it("accepts the query with a leading question mark", () => {
    expect(buildLeadsBackHref("?vehicleType=MOTO")).toBe("/admin/leads?vehicleType=MOTO");
  });

  it.each([
    [undefined, "/admin/leads"],
    ["", "/admin/leads"],
    ["evil=https://example.com", "/admin/leads"],
    ["status=HACKED", "/admin/leads"],
    ["page=0", "/admin/leads"],
    ["from=ayer", "/admin/leads"],
  ])("falls back to the plain list for %j", (back, expected) => {
    expect(buildLeadsBackHref(back)).toBe(expected);
  });

  it("takes the first value when the parameter is repeated", () => {
    expect(buildLeadsBackHref(["status=NEW", "status=LOST"])).toBe("/admin/leads?status=NEW");
  });
});
