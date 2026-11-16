import { describe, expect, it } from "vitest";
import { CREDIT_LINKS, CREDIT_TEXT } from "./credit-footer";

describe("credit footer", () => {
  it("credits Rifqi Tjahyono", () => {
    expect(CREDIT_TEXT).toBe("Developed, managed, and maintained by Rifqi Tjahyono");
  });

  it("links to LinkedIn, the personal website, GitHub, and the article", () => {
    expect(CREDIT_LINKS.linkedin.href).toBe("https://www.linkedin.com/in/rifqi-tjahjono/");
    expect(CREDIT_LINKS.website.href).toBe("https://rifqi-tjahyono.com/");
    expect(CREDIT_LINKS.github.href).toBe("https://github.com/RifqiMT/pm-collaboration");
    expect(CREDIT_LINKS.article.href).toBe(
      "https://rifqi-tjahyono.com/%f0%9f%93%9d-sticky-note-chaos-to-team-clarity-reflect-together-review-progress-and-decide-what-comes-next-%f0%9f%a4%9d%f0%9f%a7%ad/",
    );
    expect(CREDIT_LINKS.linkedin.label).toMatch(/LinkedIn/i);
    expect(CREDIT_LINKS.website.label).toMatch(/website/i);
    expect(CREDIT_LINKS.github.label).toMatch(/GitHub/i);
    expect(CREDIT_LINKS.article.label).toMatch(/Article/i);
  });
});


