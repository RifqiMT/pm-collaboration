import { describe, expect, it } from "vitest";
import {
  formatHealthAverage,
  healthCategoryAverage,
  healthOverallAverage,
  HEALTH_CHECK,
} from "./content";

describe("health check averages", () => {
  const answers = [
    { body: "7,5,7,4,6,5" },
    { body: "5,5,3,4,4,5" },
  ];

  it("averages each category across shared answers", () => {
    expect(healthCategoryAverage(answers, 0)).toBe(6);
    expect(healthCategoryAverage(answers, 1)).toBe(5);
    expect(healthCategoryAverage(answers, 2)).toBe(5);
    expect(healthCategoryAverage([], 0)).toBeNull();
    expect(healthCategoryAverage(answers, HEALTH_CHECK.length)).toBeNull();
  });

  it("averages the whole room across people and questions", () => {
    expect(healthOverallAverage(answers)).toBe(5);
    expect(healthOverallAverage([])).toBeNull();
    expect(healthOverallAverage([{ body: "not-scores" }])).toBeNull();
  });

  it("formats averages for display", () => {
    expect(formatHealthAverage(5)).toBe("5");
    expect(formatHealthAverage(5.25)).toBe("5.3");
    expect(formatHealthAverage(6.0)).toBe("6");
  });
});
