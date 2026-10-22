import { describe, expect, it } from "vitest";

import { cn } from "@/lib/utils";

describe("cn", () => {
  it("junta clases y descarta las vacías", () => {
    expect(cn("px-2", false, undefined, "py-1")).toBe("px-2 py-1");
  });

  it("deja ganar a la última clase de Tailwind en conflicto", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });
});
