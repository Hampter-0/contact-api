import { describe, expect, it } from "vitest";
import { containsLinks } from "../src/modules/contact/contact.filters";

describe("containsLinks", () => {
  it("returns false for plain text", () => {
    expect(containsLinks("hello, just saying hi!")).toBe(false);
  });

  it("detects http links", () => {
    expect(containsLinks("check this out http://example.com")).toBe(true);
  });

  it("detects https links", () => {
    expect(containsLinks("visit https://example.com now")).toBe(true);
  });

  it("detects www links without protocol", () => {
    expect(containsLinks("go to www.example.com")).toBe(true);
  });

  it("detects discord invite links", () => {
    expect(containsLinks("join us discord.gg/abcdef")).toBe(true);
  });

  it("detects html tags", () => {
    expect(containsLinks("hello <script>alert(1)</script>")).toBe(true);
  });
});