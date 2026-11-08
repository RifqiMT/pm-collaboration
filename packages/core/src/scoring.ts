import type { FrameworkId, Initiative, Insight, Quadrant, RoadmapState, ScoredInitiative } from "./types";
import { HIGH_COMPLEXITY } from "./types";

function complexityIndex(initiative: Initiative): number {
  const total =
    initiative.complexityTechnical + initiative.complexityDependency + initiative.complexityUncertainty;
  return Math.round((total / 3) * 100) / 100;
}

export function scoreInitiative(initiative: Initiative, framework: FrameworkId): number {
  if (framework === "rice") {
    if (initiative.effort <= 0) return 0;
    return (initiative.reach * initiative.impact * initiative.confidence) / initiative.effort;
  }
  if (framework === "ice") {
    return initiative.iceImpact * initiative.iceConfidence * initiative.iceEase;
  }
  const complexity = complexityIndex(initiative);
  if (complexity <= 0) return 0;
  return initiative.value / complexity;
}

export function formulaLine(initiative: Initiative, framework: FrameworkId): string {
  if (framework === "rice") {
    const score = scoreInitiative(initiative, framework);
    return `(${initiative.reach} × ${initiative.impact} × ${initiative.confidence}) / ${initiative.effort} = ${formatScore(score)}`;
  }
  if (framework === "ice") {
    const score = scoreInitiative(initiative, framework);
    return `${initiative.iceImpact} × ${initiative.iceConfidence} × ${initiative.iceEase} = ${formatScore(score)}`;
  }
  const complexity = complexityIndex(initiative);
  const score = scoreInitiative(initiative, framework);
  return `${initiative.value} / ${complexity.toFixed(2)} = ${formatScore(score)}`;
}

export function formatScore(value: number): string {
  if (!Number.isFinite(value)) return "—";
  const abs = Math.abs(value);
  if (abs >= 1000) {
    const compact = value / 1000;
    return `${trimNumber(compact)}k`;
  }
  return trimNumber(value);
}

function trimNumber(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

export function medianScore(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    const left = sorted[mid - 1] ?? 0;
    const right = sorted[mid] ?? 0;
    return (left + right) / 2;
  }
  return sorted[mid] ?? 0;
}

function quadrantFor(score: number, complexity: number, scoreMedian: number): Quadrant {
  const strong = score >= scoreMedian;
  const heavy = complexity >= HIGH_COMPLEXITY;
  if (strong && !heavy) return "do-first";
  if (strong && heavy) return "big-bet";
  if (!strong && !heavy) return "fill-in";
  return "reconsider";
}

function insightFor(
  initiative: Initiative,
  framework: FrameworkId,
  quadrant: Quadrant,
  complexity: number,
): Insight {
  if (framework === "rice" && initiative.confidence < 0.6) {
    return {
      tone: "warn",
      title: "Thin confidence",
      detail: "The outcome is still a hypothesis. Run a discovery spike before this bet locks a roadmap slot.",
    };
  }
  if (framework === "rice" && initiative.reach < 50 && initiative.effort >= 3) {
    return {
      tone: "warn",
      title: "Narrow reach for the effort",
      detail: "Few people feel this, and it is expensive. Keep it only if the outcome is strategic.",
    };
  }
  if (quadrant === "do-first") {
    return {
      tone: "good",
      title: "Do this first",
      detail: "The score is strong and the complexity is something the team can hold. A good candidate for the next slice.",
    };
  }
  if (quadrant === "big-bet") {
    return {
      tone: "warn",
      title: "Sequence this bet",
      detail: `Complexity is ${complexity.toFixed(1)} of 5. The outcome is worth it only if you ship a thinner first release.`,
    };
  }
  if (quadrant === "fill-in") {
    return {
      tone: "good",
      title: "Small and simple",
      detail: "Low complexity, modest score. Keep it if it clears the path for a larger outcome. Otherwise leave it.",
    };
  }
  return {
    tone: "risk",
    title: "Park it",
    detail: "The score is weak and the complexity is high. Sharpen the business outcome before it returns to the board.",
  };
}

export function scoreRoadmap(state: RoadmapState): ScoredInitiative[] {
  const scored = state.initiatives.map((initiative) => {
    const score = scoreInitiative(initiative, state.framework);
    const complexity = complexityIndex(initiative);
    return { initiative, score, complexity };
  });
  const scoreMedian = medianScore(scored.map((item) => item.score));
  const max = Math.max(1, ...scored.map((item) => item.score));
  const ranked = [...scored].sort((a, b) => b.score - a.score || a.initiative.title.localeCompare(b.initiative.title));
  const rankById = new Map(ranked.map((item, index) => [item.initiative.id, index + 1]));

  return ranked.map((item) => {
    const quadrant = quadrantFor(item.score, item.complexity, scoreMedian);
    return {
      initiative: item.initiative,
      score: item.score,
      complexity: item.complexity,
      formula: formulaLine(item.initiative, state.framework),
      insight: insightFor(item.initiative, state.framework, quadrant, item.complexity),
      quadrant,
      rank: rankById.get(item.initiative.id) ?? 0,
      bar: item.score / max,
    };
  });
}

export const QUADRANT_LABEL: Record<Quadrant, string> = {
  "do-first": "Do first",
  "big-bet": "Big bet",
  "fill-in": "Fill-in",
  reconsider: "Reconsider",
};

export const FRAMEWORKS: { id: FrameworkId; name: string; formula: string; help: string }[] = [
  {
    id: "rice",
    name: "RICE",
    formula: "(Reach × Impact × Confidence) / Effort",
    help: "Intercom’s RICE score. Reach is people or accounts this quarter. Impact uses the 0.25–3 scale. Confidence is a fraction. Effort is person-months.",
  },
  {
    id: "ice",
    name: "ICE",
    formula: "Impact × Confidence × Ease",
    help: "A fast growth score. Each input is 1 to 10. Ease is how little friction there is to ship, which is the inverse of effort.",
  },
  {
    id: "value-complexity",
    name: "Value / complexity",
    formula: "Business value / complexity index",
    help: "Business value is 1 to 10. Complexity is the average of technical difficulty, dependency load, and uncertainty, each 1 to 5.",
  },
];
