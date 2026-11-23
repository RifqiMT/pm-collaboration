import { describe, expect, it } from "vitest";
import { GLOSSARY, glossaryParagraphs } from "./glossary";
import { scoreInitiative } from "./scoring";

const entries = GLOSSARY.flatMap((group) => group.entries);

describe("glossary", () => {
  it("defines variables, metrics, and formulas in plain English", () => {
    expect(GLOSSARY.length).toBeGreaterThanOrEqual(7);
    expect(entries.length).toBeGreaterThanOrEqual(38);
    expect(entries.some((entry) => entry.kind === "variable")).toBe(true);
    expect(entries.some((entry) => entry.kind === "metric")).toBe(true);
    expect(entries.filter((entry) => entry.kind === "formula").length).toBeGreaterThanOrEqual(4);
    const ids = entries.map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const group of GLOSSARY) {
      expect(group.intro.length).toBeGreaterThan(20);
      expect(group.entries.length).toBeGreaterThan(0);
      expect(group.intro, group.id).not.toMatch(/[—–]/);
    }
    for (const entry of entries) {
      expect(entry.name.length).toBeGreaterThan(2);
      expect(entry.plain.length).toBeGreaterThan(40);
      expect(glossaryParagraphs(entry.plain).length, entry.id).toBeGreaterThan(0);
      expect(entry.where.length).toBeGreaterThan(8);
      const text = [entry.name, entry.plain, entry.formula ?? "", entry.example ?? "", entry.where].join("\n");
      expect(text, entry.id).not.toMatch(/[—–]/);
    }
  });

  it("uses the same RICE example the scorer computes", () => {
    const rice = entries.find((entry) => entry.id === "rice");
    expect(rice?.formula).toBe("RICE score = (Reach times Impact times Confidence) divided by Effort.");
    expect(rice?.example).toContain("320");
    expect(
      scoreInitiative(
        {
          id: "bet",
          title: "Retry",
          outcome: "Recover",
          assumption: "The token exists",
          reach: 400,
          impact: 2,
          confidence: 0.8,
          effort: 2,
          iceImpact: 1,
          iceConfidence: 1,
          iceEase: 1,
          value: 1,
          complexityTechnical: 1,
          complexityDependency: 1,
          complexityUncertainty: 1,
          horizon: "now",
          ownerId: null,
        },
        "rice",
      ),
    ).toBe(320);
  });
});
