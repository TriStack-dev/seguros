import { describe, expect, it } from "vitest";
import { formatRequestNumber, parseRequestNumber } from "./request-number";

describe("formatRequestNumber", () => {
  it("pads values to at least six digits", () => {
    expect(formatRequestNumber(123)).toBe("MS-000123");
    expect(formatRequestNumber(123456)).toBe("MS-123456");
    expect(formatRequestNumber(1234567)).toBe("MS-1234567");
  });
});

describe("parseRequestNumber", () => {
  it.each([ ["MS-000123", 123], ["000123", 123], ["123", 123] ])(
    "parses %s",
    (value, expected) => expect(parseRequestNumber(value)).toBe(expected),
  );

  it.each(["", "MS-", "MS-12x", "0", "-1", "9007199254740992"])(
    "rejects invalid request number %s",
    (value) => expect(parseRequestNumber(value)).toBeNull(),
  );
});
