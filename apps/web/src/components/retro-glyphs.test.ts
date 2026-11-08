import { RETRO_TEMPLATES } from "@cadence/core";
import { describe, expect, it } from "vitest";
import { hasRetroGlyph } from "./retro-glyphs";

describe("retro glyphs", () => {
  it("draws a graphic for every column of every template", () => {
    for (const [templateId, template] of Object.entries(RETRO_TEMPLATES)) {
      for (const column of template.columns) {
        expect(hasRetroGlyph(templateId, column.id), `${templateId}:${column.id}`).toBe(true);
      }
    }
  });
});
