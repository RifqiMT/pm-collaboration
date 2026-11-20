import type { RetroDeck, RetroDeckSlide } from "@cadence/core";
import PptxGenJS from "pptxgenjs";

const INK = "12141A";
const INK_SOFT = "5C6573";
const PAPER = "F4F5F7";
const CARD = "FFFFFF";
const LINE = "E3E6EC";
const ACCENT = "E23B16";
const SAGE = "0D7A45";
const FONT = "Calibri";

/** Build a professional PPTX blob from a retrospective deck model. */
export async function buildRetroPptx(deck: RetroDeck): Promise<Blob> {
  const pptx = new PptxGenJS();
  pptx.author = "TeamCompass";
  pptx.title = `${deck.title} — Retrospective`;
  pptx.subject = "Retrospective summary";
  pptx.company = "TeamCompass";
  pptx.layout = "LAYOUT_WIDE";

  for (const slide of deck.slides) {
    const page = pptx.addSlide();
    page.background = { color: PAPER };
    paintChrome(pptx, page, deck, slideHeading(slide));
    switch (slide.kind) {
      case "icebreaker":
        paintIcebreaker(pptx, page, slide);
        break;
      case "durations":
        paintDurations(page, slide);
        break;
      case "discussOrder":
        paintDiscussOrder(page, slide);
        break;
      case "overview":
        paintOverview(pptx, page, slide);
        break;
      case "category":
        paintCategory(page, slide);
        break;
      case "topVotes":
        paintTopVotes(page, slide);
        break;
      case "actions":
        paintActions(page, slide);
        break;
    }
  }

  const output = await pptx.write({ outputType: "blob" });
  if (!(output instanceof Blob)) {
    throw new Error("PowerPoint export did not return a file.");
  }
  return output;
}

function slideHeading(slide: RetroDeckSlide): string {
  if (slide.kind === "category") {
    const count = slide.noteCount;
    return `Category · ${slide.title} · ${count} ${count === 1 ? "note" : "notes"}`;
  }
  return slide.title;
}

function paintChrome(pptx: PptxGenJS, page: PptxGenJS.Slide, deck: RetroDeck, heading: string): void {
  page.addShape(pptx.ShapeType.rect, {
    x: 0,
    y: 0,
    w: "100%",
    h: 0.12,
    fill: { color: ACCENT },
    line: { color: ACCENT },
  });
  page.addText("TeamCompass", {
    x: 0.55,
    y: 0.28,
    w: 3.2,
    h: 0.28,
    fontFace: FONT,
    fontSize: 11,
    bold: true,
    color: ACCENT,
    margin: 0,
  });
  page.addText(deck.template, {
    x: 3.8,
    y: 0.28,
    w: 8.5,
    h: 0.28,
    fontFace: FONT,
    fontSize: 11,
    color: INK_SOFT,
    align: "right",
    margin: 0,
  });
  page.addText(heading, {
    x: 0.55,
    y: 0.58,
    w: 12,
    h: 0.48,
    fontFace: FONT,
    fontSize: 26,
    bold: true,
    color: INK,
    margin: 0,
  });
  page.addText(deck.title, {
    x: 0.55,
    y: 1.05,
    w: 12,
    h: 0.28,
    fontFace: FONT,
    fontSize: 12,
    color: INK_SOFT,
    margin: 0,
  });
  page.addShape(pptx.ShapeType.rect, {
    x: 0.55,
    y: 1.4,
    w: 12.1,
    h: 0.015,
    fill: { color: LINE },
    line: { color: LINE },
  });
  page.addText(`${deck.code}  ·  ${deck.people.length} people  ·  ${formatDate(deck.generatedAt)}`, {
    x: 0.55,
    y: 6.95,
    w: 12.1,
    h: 0.28,
    fontFace: FONT,
    fontSize: 10,
    color: INK_SOFT,
    margin: 0,
  });
}

function paintIcebreaker(
  pptx: PptxGenJS,
  page: PptxGenJS.Slide,
  slide: Extract<RetroDeckSlide, { kind: "icebreaker" }>,
): void {
  addMetricCard(pptx, page, 0.55, 5.8, "Game", slide.game);
  addMetricCard(pptx, page, 6.55, 6.1, "Duration", `${slide.durationSeconds} seconds`);

  if (slide.answers.length === 0) {
    page.addText("No icebreaker answers were shared.", {
      x: 0.55,
      y: 3.1,
      w: 12.1,
      h: 0.4,
      fontFace: FONT,
      fontSize: 14,
      color: INK_SOFT,
      margin: 0,
    });
    return;
  }

  page.addTable(
    [
      [
        { text: "Person", options: { bold: true, color: INK } },
        { text: "Answer", options: { bold: true, color: INK } },
        { text: "Prompt", options: { bold: true, color: INK } },
      ],
      ...slide.answers.slice(0, 10).map((answer) => [
        { text: clip(answer.author, 28), options: { color: INK } },
        { text: clip(answer.body, 70), options: { color: INK } },
        { text: clip(answer.question, 48), options: { color: INK_SOFT } },
      ]),
    ],
    tableOpts(0.55, 3.05, [2.4, 5.4, 4.3], 12),
  );
}

function addMetricCard(
  pptx: PptxGenJS,
  page: PptxGenJS.Slide,
  x: number,
  width: number,
  label: string,
  value: string,
): void {
  page.addShape(pptx.ShapeType.roundRect, {
    x,
    y: 1.65,
    w: width,
    h: 1.15,
    fill: { color: CARD },
    line: { color: LINE },
    shadow: { type: "outer", color: "12141A", blur: 8, offset: 2, opacity: 0.08 },
  });
  page.addText(label, {
    x: x + 0.2,
    y: 1.78,
    w: width - 0.4,
    h: 0.25,
    fontFace: FONT,
    fontSize: 11,
    color: INK_SOFT,
    margin: 0,
  });
  page.addText(value, {
    x: x + 0.2,
    y: 2.05,
    w: width - 0.4,
    h: 0.45,
    fontFace: FONT,
    fontSize: 20,
    bold: true,
    color: INK,
    margin: 0,
  });
}

function paintDiscussOrder(
  page: PptxGenJS.Slide,
  slide: Extract<RetroDeckSlide, { kind: "discussOrder" }>,
): void {
  const basisLabel = slide.basis === "author" ? "Walked by author" : "Walked by category";
  page.addText(basisLabel, {
    x: 0.55,
    y: 1.55,
    w: 12.1,
    h: 0.3,
    fontFace: FONT,
    fontSize: 13,
    color: INK_SOFT,
    margin: 0,
  });

  if (slide.overall.length === 0) {
    page.addText("No raised-hand speaking order was recorded during Discuss.", {
      x: 0.55,
      y: 2.1,
      w: 12.1,
      h: 0.4,
      fontFace: FONT,
      fontSize: 14,
      color: INK_SOFT,
      margin: 0,
    });
    return;
  }

  page.addText("Room speaking order", {
    x: 0.55,
    y: 1.95,
    w: 5.8,
    h: 0.3,
    fontFace: FONT,
    fontSize: 14,
    bold: true,
    color: INK,
    margin: 0,
  });
  page.addTable(
    [
      [
        { text: "#", options: { bold: true, color: INK } },
        { text: "Person", options: { bold: true, color: INK } },
      ],
      ...slide.overall.slice(0, 12).map((speaker) => [
        { text: String(speaker.order), options: { color: ACCENT, bold: true } },
        { text: clip(speaker.name, 36), options: { color: INK } },
      ]),
    ],
    tableOpts(0.55, 2.3, [0.8, 5.0], 12, 5.8),
  );

  page.addText("By category", {
    x: 6.7,
    y: 1.95,
    w: 5.9,
    h: 0.3,
    fontFace: FONT,
    fontSize: 14,
    bold: true,
    color: INK,
    margin: 0,
  });

  if (slide.byCategory.length === 0) {
    page.addText("No category breakdown available.", {
      x: 6.7,
      y: 2.35,
      w: 5.9,
      h: 0.35,
      fontFace: FONT,
      fontSize: 12,
      color: INK_SOFT,
      margin: 0,
    });
    return;
  }

  const breakdownRows = slide.byCategory.flatMap((group) => {
    if (group.speakers.length === 0) {
      return [[{ text: group.category, options: { bold: true, color: INK } }, { text: "—", options: { color: INK_SOFT } }]];
    }
    return group.speakers.map((speaker, index) => [
      {
        text: index === 0 ? group.category : "",
        options: { bold: index === 0, color: INK },
      },
      {
        text: `${speaker.order}. ${clip(speaker.name, 28)}`,
        options: { color: INK },
      },
    ]);
  });

  page.addTable(
    [
      [
        { text: "Category", options: { bold: true, color: INK } },
        { text: "Speaking order", options: { bold: true, color: INK } },
      ],
      ...breakdownRows.slice(0, 14),
    ],
    tableOpts(6.7, 2.3, [2.4, 3.5], 12, 5.9),
  );
}

function paintOverview(
  pptx: PptxGenJS,
  page: PptxGenJS.Slide,
  slide: Extract<RetroDeckSlide, { kind: "overview" }>,
): void {
  const cardW = 2.9;
  const gap = 0.2;
  const metrics = [
    { label: "Notes", value: String(slide.notesTotal), detail: `${slide.notesByCategory.length} categories` },
    {
      label: "Votes",
      value: `${slide.votesCast}/${slide.votesTotal}`,
      detail: "Cast vs total",
    },
    { label: "People", value: String(slide.people), detail: "In the room" },
    {
      label: "Actions",
      value: String(slide.actionsTotal),
      detail: `${slide.actionsOpen} open · ${slide.actionsDone} done`,
    },
  ];
  metrics.forEach((metric, index) => {
    const x = 0.55 + index * (cardW + gap);
    page.addShape(pptx.ShapeType.roundRect, {
      x,
      y: 1.6,
      w: cardW,
      h: 1.35,
      fill: { color: CARD },
      line: { color: LINE },
      shadow: { type: "outer", color: "12141A", blur: 8, offset: 2, opacity: 0.08 },
    });
    page.addText(metric.label, {
      x: x + 0.18,
      y: 1.72,
      w: cardW - 0.36,
      h: 0.25,
      fontFace: FONT,
      fontSize: 11,
      color: INK_SOFT,
      margin: 0,
    });
    page.addText(metric.value, {
      x: x + 0.18,
      y: 2.05,
      w: cardW - 0.36,
      h: 0.4,
      fontFace: FONT,
      fontSize: 22,
      bold: true,
      color: INK,
      margin: 0,
    });
    page.addText(metric.detail, {
      x: x + 0.18,
      y: 2.5,
      w: cardW - 0.36,
      h: 0.28,
      fontFace: FONT,
      fontSize: 11,
      color: INK_SOFT,
      margin: 0,
    });
  });

  page.addText("Notes by category", {
    x: 0.55,
    y: 3.2,
    w: 5.9,
    h: 0.3,
    fontFace: FONT,
    fontSize: 14,
    bold: true,
    color: INK,
    margin: 0,
  });
  page.addTable(
    [
      [
        { text: "Category", options: { bold: true, color: INK } },
        { text: "Notes", options: { bold: true, color: INK } },
      ],
      ...slide.notesByCategory.map((row) => [
        { text: clip(row.category, 36), options: { color: INK } },
        { text: String(row.count), options: { color: INK, align: "right" as const } },
      ]),
    ],
    tableOpts(0.55, 3.55, [4.2, 1.7], 12, 5.9),
  );

  page.addText("Actions by owner", {
    x: 6.7,
    y: 3.2,
    w: 5.9,
    h: 0.3,
    fontFace: FONT,
    fontSize: 14,
    bold: true,
    color: INK,
    margin: 0,
  });
  if (slide.actionsByOwner.length === 0) {
    page.addText("No actions were recorded.", {
      x: 6.7,
      y: 3.6,
      w: 5.9,
      h: 0.35,
      fontFace: FONT,
      fontSize: 12,
      color: INK_SOFT,
      margin: 0,
    });
    return;
  }
  page.addTable(
    [
      [
        { text: "Owner", options: { bold: true, color: INK } },
        { text: "Total", options: { bold: true, color: INK } },
        { text: "Open", options: { bold: true, color: INK } },
        { text: "Done", options: { bold: true, color: INK } },
      ],
      ...slide.actionsByOwner.slice(0, 8).map((row) => [
        { text: clip(row.owner, 24), options: { color: INK } },
        { text: String(row.count), options: { color: INK, align: "right" as const } },
        { text: String(row.open), options: { color: ACCENT, align: "right" as const } },
        { text: String(row.done), options: { color: SAGE, align: "right" as const } },
      ]),
    ],
    tableOpts(6.7, 3.55, [2.5, 1.1, 1.1, 1.2], 12, 5.9),
  );
}

function paintDurations(
  page: PptxGenJS.Slide,
  slide: Extract<RetroDeckSlide, { kind: "durations" }>,
): void {
  const total = slide.rows.reduce((sum, row) => sum + row.seconds, 0);
  page.addText(`Total time across sections: ${total} seconds`, {
    x: 0.55,
    y: 1.65,
    w: 12.1,
    h: 0.35,
    fontFace: FONT,
    fontSize: 14,
    color: INK_SOFT,
    margin: 0,
  });

  page.addTable(
    [
      [
        { text: "Section", options: { bold: true, color: INK } },
        { text: "Duration (seconds)", options: { bold: true, color: INK } },
      ],
      ...slide.rows.map((row) => [
        { text: row.section, options: { color: INK } },
        { text: String(row.seconds), options: { color: INK, align: "right" as const } },
      ]),
    ],
    tableOpts(0.55, 2.15, [7.5, 4.6], 14),
  );
}

function paintCategory(
  page: PptxGenJS.Slide,
  slide: Extract<RetroDeckSlide, { kind: "category" }>,
): void {
  const countLabel = `${slide.noteCount} ${slide.noteCount === 1 ? "note" : "notes"} in this category`;
  page.addText(countLabel, {
    x: 0.55,
    y: 1.55,
    w: 12.1,
    h: 0.28,
    fontFace: FONT,
    fontSize: 13,
    bold: true,
    color: INK,
    margin: 0,
  });
  if (slide.hint) {
    page.addText(slide.hint, {
      x: 0.55,
      y: 1.85,
      w: 12.1,
      h: 0.3,
      fontFace: FONT,
      fontSize: 12,
      color: INK_SOFT,
      margin: 0,
    });
  }

  const tableY = slide.hint ? 2.25 : 1.95;
  if (slide.notes.length === 0) {
    page.addText("No notes in this category.", {
      x: 0.55,
      y: tableY,
      w: 12.1,
      h: 0.4,
      fontFace: FONT,
      fontSize: 14,
      color: INK_SOFT,
      margin: 0,
    });
    return;
  }

  page.addTable(
    [
      [
        { text: "Note", options: { bold: true, color: INK } },
        { text: "Author", options: { bold: true, color: INK } },
        { text: "Votes", options: { bold: true, color: INK } },
      ],
      ...slide.notes.slice(0, 12).map((note) => [
        { text: clip(note.body, 90), options: { color: INK } },
        { text: clip(note.author, 24), options: { color: INK_SOFT } },
        { text: String(note.votes), options: { color: INK, align: "right" as const } },
      ]),
    ],
    tableOpts(0.55, tableY, [8.2, 2.4, 1.5], 12),
  );
}

function paintTopVotes(
  page: PptxGenJS.Slide,
  slide: Extract<RetroDeckSlide, { kind: "topVotes" }>,
): void {
  if (slide.notes.length === 0) {
    page.addText("No voted notes yet.", {
      x: 0.55,
      y: 1.7,
      w: 12.1,
      h: 0.4,
      fontFace: FONT,
      fontSize: 14,
      color: INK_SOFT,
      margin: 0,
    });
    return;
  }

  page.addTable(
    [
      [
        { text: "#", options: { bold: true, color: INK } },
        { text: "Category", options: { bold: true, color: INK } },
        { text: "Note", options: { bold: true, color: INK } },
        { text: "Votes", options: { bold: true, color: INK } },
      ],
      ...slide.notes.map((note, index) => [
        { text: String(index + 1), options: { color: ACCENT, bold: true } },
        { text: clip(note.column, 24), options: { color: INK } },
        { text: clip(note.body, 72), options: { color: INK } },
        { text: String(note.votes), options: { color: INK, align: "right" as const } },
      ]),
    ],
    tableOpts(0.55, 1.7, [0.7, 2.4, 7.5, 1.5], 13),
  );
}

function paintActions(
  page: PptxGenJS.Slide,
  slide: Extract<RetroDeckSlide, { kind: "actions" }>,
): void {
  if (slide.actions.length === 0) {
    page.addText("No actions were recorded.", {
      x: 0.55,
      y: 1.7,
      w: 12.1,
      h: 0.4,
      fontFace: FONT,
      fontSize: 14,
      color: INK_SOFT,
      margin: 0,
    });
    return;
  }

  page.addTable(
    [
      [
        { text: "Action", options: { bold: true, color: INK } },
        { text: "Owner", options: { bold: true, color: INK } },
        { text: "Status", options: { bold: true, color: INK } },
      ],
      ...slide.actions.slice(0, 12).map((action) => [
        {
          text: clip(action.source ? `${action.body} (from “${action.source}”)` : action.body, 90),
          options: { color: INK },
        },
        { text: clip(action.owner, 28), options: { color: INK } },
        {
          text: action.done ? "Done" : "Open",
          options: { color: action.done ? SAGE : ACCENT, bold: true },
        },
      ]),
    ],
    tableOpts(0.55, 1.7, [8.0, 2.6, 1.5], 12),
  );
}

function tableOpts(x: number, y: number, colW: number[], fontSize: number, width = 12.1) {
  const edge = { color: LINE, pt: 0.5 } as const;
  return {
    x,
    y,
    w: width,
    colW,
    border: [edge, edge, edge, edge] as [
      { color: string; pt: number },
      { color: string; pt: number },
      { color: string; pt: number },
      { color: string; pt: number },
    ],
    fontFace: FONT,
    fontSize,
    color: INK,
    align: "left" as const,
    valign: "middle" as const,
    fill: { color: CARD },
  };
}

function clip(value: string, max: number): string {
  const text = value.replace(/\s+/g, " ").trim();
  if (text.length <= max) return text;
  return `${text.slice(0, Math.max(0, max - 1)).trimEnd()}…`;
}

function formatDate(iso: string): string {
  const date = new Date(iso);
  if (!Number.isFinite(date.getTime())) return iso;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
