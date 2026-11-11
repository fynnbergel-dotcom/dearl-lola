import { describe, expect, it } from "vitest";
import { displayFirstName, isLola, judgeName } from "./name";

describe("isLola", () => {
  it.each([
    "Lola",
    "lola",
    "LOLA",
    "  Lola  ",
    "Lolá",
    "Lólà",
    "Lo-la",
    "Lo.la",
    "Lola M.",
    "Lola Martínez",
    "lola,",
  ])("accepts %j", (name) => expect(isLola(name)).toBe(true));

  it.each(["Lolita", "Lolly", "Lol", "Dolores", "Layla", "", "   ", "La Lola"])("rejects %j", (name) =>
    expect(isLola(name)).toBe(false),
  );
});

describe("displayFirstName", () => {
  it("capitalises and trims", () => {
    expect(displayFirstName("  fRANCESCA  ")).toBe("Francesca");
  });
  it("keeps accents and hyphens", () => {
    expect(displayFirstName("josé-maría lópez")).toBe("José-maría");
  });
  it("strips markup-ish characters", () => {
    expect(displayFirstName("<script>")).toBe("Script");
  });
});

describe("judgeName", () => {
  it("returns null for empty input", () => {
    expect(judgeName("   ")).toBeNull();
  });
  it("greets Lolas as Lola, not honorary", () => {
    expect(judgeName("lolá m.")).toEqual({ greetingName: "Lola", isHonorary: false });
  });
  it("makes everyone else honorary", () => {
    expect(judgeName("sam")).toEqual({ greetingName: "Sam", isHonorary: true });
  });
  it("returns null when nothing usable remains", () => {
    expect(judgeName("!!!")).toBeNull();
  });
});
