import { LIMITS, type ColumnTone, type IcebreakerPair, type IcebreakerId, type RetroColumn, type RetroTemplateId, type ReviewDecision, type ReviewState, type RoomKind } from "./types";

export interface RitualCopy {
  kind: RoomKind;
  name: string;
  promise: string;
  steps: string[];
}

export const RITUALS: RitualCopy[] = [
  {
    kind: "retro",
    name: "Retrospective",
    promise: "Surface what the sprint felt like, then leave with owners.",
    steps: ["Icebreaker", "Private notes", "Discuss", "Dot vote", "Actions", "Summary"],
  },
  {
    kind: "planning",
    name: "Sprint planning",
    promise: "Set a Sprint Goal, forecast what can be Done, and plan how.",
    steps: ["Why", "What", "How", "Forecast"],
  },
  {
    kind: "refinement",
    name: "Backlog refinement",
    promise: "Add detail, size, and order so an item can be selected later.",
    steps: ["Detail", "Split", "Size", "Order"],
  },
  {
    kind: "review",
    name: "Sprint review",
    promise: "Inspect the Increment with stakeholders, then adapt the Product Backlog.",
    steps: ["Sprint Goal", "Increment", "Stakeholders", "Adapt"],
  },
  {
    kind: "roadmap",
    name: "Roadmap",
    promise: "Score bets with RICE, and read complexity next to the business outcome.",
    steps: ["Outcome", "Score", "Complexity", "Sequence"],
  },
];

export const ICEBREAKER_GROUPS = [
  { id: "check-in", label: "Quick check-ins", minutes: "2–5 minutes" },
  { id: "creative", label: "Creative games", minutes: "5–8 minutes" },
  { id: "connection", label: "Connection-building", minutes: "5–10 minutes" },
] as const;

export type IcebreakerGroup = (typeof ICEBREAKER_GROUPS)[number]["id"];

export type IcebreakerMode = "word" | "choice" | "line" | "sprint" | "note" | "emoji" | "gif" | "draw" | "truths" | "pairs" | "scale" | "map" | "order";

export interface IcebreakerGame {
  id: IcebreakerId;
  name: string;
  blurb: string;
  how: string;
  prompt: string;
  group: IcebreakerGroup;
  mode: IcebreakerMode;
  placeholder?: string;
  choices?: readonly string[];
  rounds?: readonly [string, string][];
  questions?: readonly string[];
  seconds?: number;
}

export interface HealthQuestion {
  title: string;
  statement: string;
}

export const HEALTH_CHECK: readonly HealthQuestion[] = [
  { title: "Appreciation", statement: "My colleagues appreciate my contribution to the team." },
  { title: "Team Spirit", statement: "There is a trusting working atmosphere in our team." },
  { title: "Transparency", statement: "Everyone in my team knows who is currently working on what." },
  { title: "Recovery & Breaks", statement: "I have enough room for breaks in which I can draw new energy." },
  { title: "Meeting culture", statement: "Our meetings are well structured, yet leave room for creativity and new ideas." },
  { title: "Support", statement: "In my team, each team member passes on their individual knowledge and experience." },
];

const HEALTH_POINT_LABELS = [
  "",
  "Strongly disagree",
  "Disagree",
  "Slightly disagree",
  "Neutral",
  "Slightly agree",
  "Agree",
  "Strongly agree",
] as const;

export function healthPointLabel(point: number): string {
  return HEALTH_POINT_LABELS[point] ?? "";
}

export function parseHealthScores(body: string): number[] | null {
  const parts = body.split(",").map((part) => part.trim());
  if (parts.length !== HEALTH_CHECK.length) return null;
  const scores = parts.map((part) => Number(part));
  if (scores.some((score) => !Number.isInteger(score) || score < 1 || score > 7)) return null;
  return scores;
}

export function formatHealthScores(scores: readonly number[]): string {
  return scores.join(",");
}

export function healthCheckExportText(body: string): string {
  const scores = parseHealthScores(body);
  if (!scores) return body;
  return HEALTH_CHECK.map((question, index) => `${question.title}: ${healthPointLabel(scores[index] ?? 0)}`).join(". ");
}

/** Mean score for one Health Check question across shared answers. */
export function healthCategoryAverage(
  answers: readonly { body: string }[],
  questionIndex: number,
): number | null {
  if (questionIndex < 0 || questionIndex >= HEALTH_CHECK.length) return null;
  const values: number[] = [];
  for (const answer of answers) {
    const scores = parseHealthScores(answer.body);
    const score = scores?.[questionIndex];
    if (score != null) values.push(score);
  }
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

/** Mean of every shared Health Check score across people and questions. */
export function healthOverallAverage(answers: readonly { body: string }[]): number | null {
  const values: number[] = [];
  for (const answer of answers) {
    const scores = parseHealthScores(answer.body);
    if (!scores) continue;
    values.push(...scores);
  }
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

export function formatHealthAverage(value: number): string {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

export const ICEBREAKERS: readonly IcebreakerGame[] = [
  {
    id: "one-word-sprint",
    name: "One-Word Sprint",
    blurb: "One word for the sprint, then a short explanation if you want.",
    how: "Everyone shares one word describing the sprint, followed by an optional short explanation.",
    prompt: "Describe this sprint in one word.",
    placeholder: "Ready — we shipped",
    group: "check-in",
    mode: "sprint",
  },
  {
    id: "weather",
    name: "Weather Report",
    blurb: "The sprint as a forecast.",
    how: "Each person describes their sprint experience as a weather forecast.",
    prompt: "Was your sprint sunny, stormy, foggy, or changeable?",
    placeholder: "A short forecast, if you want one",
    group: "check-in",
    mode: "note",
    choices: ["Sunny", "Stormy", "Foggy", "Changeable"],
  },
  {
    id: "emoji",
    name: "Emoji Check-In",
    blurb: "One emoji, then one sentence.",
    how: "Everyone posts an emoji and explains their choice in one sentence.",
    prompt: "Which emoji captures how this sprint felt?",
    placeholder: "One sentence about that emoji",
    group: "check-in",
    mode: "emoji",
    choices: ["😀", "😅", "😌", "🤔", "😴", "🔥", "🌧️", "🎢", "🐢", "🚀", "💪", "🎉"],
  },
  {
    id: "energy",
    name: "Energy Meter",
    blurb: "A rating from 1 to 5.",
    how: "Everyone rates their current energy from 1–5. An explanation is welcome, not required.",
    prompt: "How much energy are you bringing into today's retro?",
    placeholder: "A short note, if you want one",
    group: "check-in",
    mode: "note",
    choices: ["1", "2", "3", "4", "5"],
  },
  {
    id: "this-or-that",
    name: "This or That",
    blurb: "A few rapid-fire pairs.",
    how: "Pick a side on every pair. Everyone's answers show once you have chosen them all.",
    prompt: "Pick a side.",
    group: "check-in",
    mode: "pairs",
    rounds: [
      ["Morning", "Evening"],
      ["Coffee", "Tea"],
      ["Quiet workspace", "Background music"],
    ],
    questions: ["Morning or Evening?", "Coffee or Tea?", "Quiet workspace or Background music?"],
  },
  {
    id: "word-association",
    name: "Word Association",
    blurb: "The next word, immediately.",
    how: "Start from “sprint” and go around the group. Each person adds one associated word.",
    prompt: "Sprint. What is the next word?",
    placeholder: "One word",
    group: "check-in",
    mode: "word",
  },
  {
    id: "one-word",
    name: "One word",
    blurb: "How is everyone arriving?",
    how: "Each person arrives with a single word.",
    prompt: "In one word, how are you arriving?",
    placeholder: "One word",
    group: "check-in",
    mode: "word",
  },
  {
    id: "feelings",
    name: "Feelings",
    blurb: "A check-in on how everyone is arriving.",
    how: "Pick the feeling closest to how you are arriving.",
    prompt: "How are you feeling right now?",
    group: "check-in",
    mode: "choice",
    choices: ["Calm", "Energized", "Hopeful", "Curious", "Tired", "Anxious", "Frustrated", "Unsure"],
  },
  {
    id: "movie-title",
    name: "Sprint Movie Title",
    blurb: "A title for what just happened.",
    how: "Everyone gives the sprint a real or invented movie title and briefly explains why.",
    prompt: "What movie title fits this sprint?",
    placeholder: "Mission: Almost Possible",
    group: "creative",
    mode: "line",
  },
  {
    id: "gif",
    name: "GIF of the Sprint",
    blurb: "A GIF link for the last two weeks.",
    how: "Each person shares a GIF representing their sprint experience.",
    prompt: "Find a GIF that captures your last two weeks.",
    placeholder: "https://",
    group: "creative",
    mode: "gif",
  },
  {
    id: "draw",
    name: "Draw the Sprint",
    blurb: "Sixty seconds with a pen.",
    how: "Give everyone 60 seconds to draw their experience, then share the drawings. Artistic ability is irrelevant.",
    prompt: "Was it a rollercoaster, a clear highway, or a maze?",
    group: "creative",
    mode: "draw",
    seconds: 60,
  },
  {
    id: "soundtrack",
    name: "Sprint Soundtrack",
    blurb: "A title track for the sprint.",
    how: "Each person chooses a song title — or invents one — that represents the sprint.",
    prompt: "What would be the title track of this sprint?",
    placeholder: "A song title",
    group: "creative",
    mode: "line",
  },
  {
    id: "headline",
    name: "Sprint Headline",
    blurb: "The sprint, as a newspaper would tell it.",
    how: "Everyone writes a short newspaper headline about the sprint.",
    prompt: "Write the headline for this sprint.",
    placeholder: "Team Defeats Release Blocker at the Eleventh Hour",
    group: "creative",
    mode: "line",
  },
  {
    id: "ten-second",
    name: "Ten-Second Drawing",
    blurb: "Same prompt, eyes closed.",
    how: "Everyone draws the same thing for ten seconds without looking, then you reveal the results together.",
    prompt: "Draw a cat in ten seconds without looking.",
    group: "creative",
    mode: "draw",
    seconds: 10,
  },
  {
    id: "health-check",
    name: "Health Check",
    blurb: "Six questions, one scale.",
    how: "Rate every statement from strongly disagree to strongly agree. The room sees how the answers spread, not who chose each point.",
    prompt: "Health Check Questions (Scale)",
    group: "connection",
    mode: "scale",
    questions: HEALTH_CHECK.map((question) => `${question.title}: ${question.statement}`),
  },
  {
    id: "travel-wishlist",
    name: "Travel Wishlist",
    blurb: "Countries you want to visit.",
    how: "Tap up to five countries on the map. Once everyone shares, a unified room map shows where wishlists overlap.",
    prompt: "Which countries are on your travel wishlist?",
    group: "connection",
    mode: "map",
  },
  {
    id: "lineup",
    name: "Lineup",
    blurb: "Put the room in an order.",
    how: "The host names what the order means. Everyone arranges the people in the room, then the lineups are compared.",
    prompt: "Order the room",
    placeholder: "Years on the team",
    group: "connection",
    mode: "order",
  },
  {
    id: "two-truths",
    name: "Two Truths and a Lie",
    blurb: "Three statements. The room guesses the false one.",
    how: "Each person shares three light statements about themselves or the sprint. Everyone else guesses the false one.",
    prompt: "Share two truths and a lie.",
    placeholder: "I fixed a bug",
    group: "connection",
    mode: "truths",
  },
  {
    id: "show-and-tell",
    name: "Desk Show-and-Tell",
    blurb: "One nearby object.",
    how: "Everyone names one nearby object, adds a picture or GIF if they want, and briefly explains its significance.",
    prompt: "Pick something on your desk that tells us a little about you.",
    placeholder: "A chipped mug from launch week",
    group: "connection",
    mode: "line",
  },
  {
    id: "gratitude",
    name: "Gratitude Shout-Out",
    blurb: "A specific thank-you from the sprint.",
    how: "Each person thanks a teammate for a specific contribution during the sprint.",
    prompt: "Who helped you move forward, and what did they do?",
    placeholder: "A person, and what they did",
    group: "connection",
    mode: "line",
  },
  {
    id: "shout-out",
    name: "Shout-out",
    blurb: "A thank-you before the retro begins.",
    how: "Name a person or a moment that deserves a thank-you before you start.",
    prompt: "Who, or what, deserves a thank-you before we start?",
    placeholder: "A person or a moment",
    group: "connection",
    mode: "line",
  },
];

export function icebreakerById(id: string): IcebreakerGame {
  return ICEBREAKERS.find((game) => game.id === id) ?? ICEBREAKERS[0]!;
}

/** Every current participant, once, in the chosen order. */
export function parsePeopleOrder(body: string, participantIds: readonly string[]): string[] | null {
  const parts = body
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
  if (parts.length !== participantIds.length) return null;
  if (new Set(parts).size !== parts.length) return null;
  const allowed = new Set(participantIds);
  if (parts.some((id) => !allowed.has(id))) return null;
  return parts;
}

export function formatPeopleOrder(ids: readonly string[]): string {
  return ids.join(",");
}

export function icebreakerChoices(game: IcebreakerGame, round: number): readonly string[] {
  if (game.rounds) return game.rounds[Math.min(Math.max(round, 0), game.rounds.length - 1)] ?? [];
  return game.choices ?? [];
}

export function pairQuestion(left: string, right: string): string {
  const a = left.replace(/\s+/g, " ").trim();
  const b = right.replace(/\s+/g, " ").trim();
  if (!a || !b) return "";
  return `${a} or ${b}?`;
}

function defaultThisOrThatPairs(): IcebreakerPair[] {
  const game = icebreakerById("this-or-that");
  return (game.rounds ?? []).map((round) => ({
    question: pairQuestion(round[0], round[1]),
    left: round[0],
    right: round[1],
  }));
}

export function storedThisOrThatPairs(value: unknown): IcebreakerPair[] | null {
  if (!Array.isArray(value)) return null;
  const pairs: IcebreakerPair[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const record = item as Record<string, unknown>;
    if (typeof record.left !== "string" || typeof record.right !== "string") continue;
    const left = record.left.replace(/\s+/g, " ").trim();
    const right = record.right.replace(/\s+/g, " ").trim();
    if (!left || !right || left.toLowerCase() === right.toLowerCase()) continue;
    if (left.length > LIMITS.icebreakerSide || right.length > LIMITS.icebreakerSide) continue;
    const question = pairQuestion(left, right);
    if (question.length > LIMITS.icebreakerQuestion) continue;
    pairs.push({ question, left, right });
    if (pairs.length >= LIMITS.icebreakerPairs) break;
  }
  return pairs.length > 0 ? pairs : null;
}

export function resolvedThisOrThatPairs(value: unknown): IcebreakerPair[] {
  return storedThisOrThatPairs(value) ?? defaultThisOrThatPairs();
}

export function thisOrThatGame(value: unknown): IcebreakerGame {
  const game = icebreakerById("this-or-that");
  const pairs = resolvedThisOrThatPairs(value);
  return {
    ...game,
    rounds: pairs.map((pair) => [pair.left, pair.right] as [string, string]),
    questions: pairs.map((pair) => pair.question),
  };
}

const MEDIA_FILE = /\.(gif|png|jpe?g|webp|avif|bmp|gifv|mp4|webm)(?:$|[?#])/i;

function httpsUrl(input: string): URL | null {
  try {
    const url = new URL(input.trim());
    if (url.protocol !== "https:" || url.username || url.password) return null;
    return url;
  } catch {
    return null;
  }
}

function href(url: URL): string {
  return `${url.origin}${url.pathname}${url.search}`;
}

function giphyId(parts: string[]): string | null {
  const media = parts.indexOf("media");
  const mediaId = media >= 0 ? parts[media + 1] : undefined;
  if (mediaId && /^[A-Za-z0-9]{6,32}$/.test(mediaId)) return mediaId;
  const leaf = (parts[parts.length - 1] ?? "").replace(/\.(gif|webp|mp4|jpg|png)$/i, "");
  if (/^[A-Za-z0-9]{6,32}$/.test(leaf) && leaf.toLowerCase() !== "giphy") return leaf;
  const tail = leaf.split("-").pop() ?? "";
  if (/^[A-Za-z0-9]{6,32}$/.test(tail)) return tail;
  return null;
}

export function previewMediaCandidates(input: string): string[] {
  const url = httpsUrl(input);
  if (!url) return [];
  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  const parts = url.pathname.split("/").filter(Boolean);

  if (host === "giphy.com" || host.endsWith(".giphy.com")) {
    const id = giphyId(parts);
    return id ? [`https://media.giphy.com/media/${id}/giphy.gif`] : [];
  }

  if (host === "i.imgur.com" || host === "imgur.com") {
    const leaf = (parts[parts.length - 1] ?? "").replace(/\.(gifv|gif|png|jpe?g|webp|mp4)$/i, "");
    if (/^[A-Za-z0-9]{5,15}$/.test(leaf)) {
      if (host === "i.imgur.com" && /\.gif$/i.test(url.pathname)) return [href(url)];
      return [`https://i.imgur.com/${leaf}.gif`, `https://i.imgur.com/${leaf}.png`, `https://i.imgur.com/${leaf}.jpg`, `https://i.imgur.com/${leaf}.webp`];
    }
  }

  if (host.endsWith("dropbox.com") && MEDIA_FILE.test(url.pathname)) {
    const raw = new URL(url.href);
    raw.searchParams.set("raw", "1");
    raw.searchParams.delete("dl");
    return [href(raw)];
  }

  if (MEDIA_FILE.test(url.pathname)) {
    if (/\.gifv(?:$|[?#])/i.test(url.pathname)) return [href(url).replace(/\.gifv(?=$|[?#])/i, ".gif")];
    return [href(url)];
  }
  return [];
}

/** Largest picture or GIF stored with a Desk Show-and-Tell answer. */
const SHOW_MEDIA_MAX = 70_000;

const SHOW_MEDIA_MARK = /^(.*?)\s*\[\[media:([^\]]+)\]\]\s*$/;
const SHOW_DATA_MEDIA = /^data:image\/(gif|png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/;

export function formatShowAndTell(text: string, media: string): string {
  const caption = text.trim();
  const picture = media.trim();
  if (!picture) return caption;
  return `${caption} [[media:${picture}]]`;
}

export function showAndTellParts(body: string): { text: string; media: string } {
  const match = SHOW_MEDIA_MARK.exec(body.trim());
  if (!match) return { text: body.trim(), media: "" };
  return { text: (match[1] ?? "").trim(), media: (match[2] ?? "").trim() };
}

/** Caption plus a link. A stored picture stays out of the CSV as raw data. */
export function showAndTellExportText(body: string): string {
  const { text, media } = showAndTellParts(body);
  if (!media) return text;
  if (media.startsWith("data:")) return text ? `${text} (picture attached)` : "Picture attached";
  return text ? `${text} ${media}` : media;
}

export function showAndTellMediaSources(media: string): string[] {
  if (!media) return [];
  if (media.startsWith("data:image/")) return SHOW_DATA_MEDIA.test(media) ? [media] : [];
  return previewMediaCandidates(media);
}

export function acceptedShowMedia(media: string): "ok" | "large" | "type" {
  if (!media) return "ok";
  if (media.startsWith("data:")) {
    if (media.length > SHOW_MEDIA_MAX) return "large";
    return SHOW_DATA_MEDIA.test(media) ? "ok" : "type";
  }
  if (media.length > LIMITS.icebreakerGif) return "large";
  return previewMediaCandidates(media).length > 0 ? "ok" : "type";
}

/** Stable shuffle of 0,1,2 for a viewer so the lie is not given away by position. */
export function truthDisplayOrder(seed: string): number[] {
  const order = [0, 1, 2];
  let state = 2166136261;
  for (let index = 0; index < seed.length; index += 1) {
    state ^= seed.charCodeAt(index);
    state = Math.imul(state, 16777619);
  }
  for (let index = order.length - 1; index > 0; index -= 1) {
    state = (Math.imul(state, 1103515245) + 12345) >>> 0;
    const swap = state % (index + 1);
    const current = order[index]!;
    order[index] = order[swap]!;
    order[swap] = current;
  }
  return order;
}

export function icebreakerHead(body: string): { head: string; note: string } {
  const match = body.match(/^(.*?)\s+[—–-]\s+(.*)$/);
  if (!match?.[1]) return { head: body, note: "" };
  return { head: match[1], note: (match[2] ?? "").trim() };
}

export type RetroTemplateGroup = "classic" | "film" | "series" | "anime" | "games" | "sport" | "music" | "food";

/** Picker shelves, in the order a host scans them. Shapes inside a shelf stay A to Z. */
export const RETRO_TEMPLATE_GROUPS: readonly { id: RetroTemplateGroup; title: string; note: string }[] = [
  { id: "classic", title: "Classic", note: "Formats teams already use to decide what to keep, stop, and try." },
  { id: "film", title: "Film", note: "Movies and cinema stories." },
  { id: "series", title: "Series", note: "Television and streaming stories." },
  { id: "anime", title: "Anime", note: "Anime series and their worlds." },
  { id: "games", title: "Games", note: "Video games and play." },
  { id: "sport", title: "Sport", note: "Races, matches, and a season." },
  { id: "music", title: "Music", note: "A live set, and the next one." },
  { id: "food", title: "Food", note: "A meal the team made, and what the next one needs." },
];

export const RETRO_TEMPLATES: Record<
  RetroTemplateId,
  {
    name: string;
    blurb: string;
    group?: RetroTemplateGroup;
    columns: { id: string; title: string; hint: string; tone: ColumnTone }[];
  }
> = {
  "start-stop-continue": {
    name: "Start, stop, continue",
    blurb: "Three decisions for the next sprint: begin it, end it, or leave it alone.",
    columns: [
      { id: "start", title: "Start", hint: "Begin this next sprint. We did not do it this sprint.", tone: "idea" },
      { id: "stop", title: "Stop", hint: "End this next sprint. It slowed this sprint down.", tone: "bad" },
      { id: "continue", title: "Continue", hint: "Leave this unchanged. It worked this sprint.", tone: "good" },
    ],
  },
  "4ls": {
    name: "4Ls",
    blurb: "Four looks at this sprint. Liked and learned stay with us. Lacked already hurt us. Longed for is a wish we have not had yet.",
    columns: [
      { id: "liked", title: "Liked", hint: "What from this sprint should we repeat, because it worked?", tone: "good" },
      { id: "learned", title: "Learned", hint: "What did this sprint teach us, and how will we use it next sprint?", tone: "idea" },
      { id: "lacked", title: "Lacked", hint: "What was missing this sprint, and what did that cost us?", tone: "bad" },
      { id: "longed", title: "Longed for", hint: "What have we never had, and still want next sprint? A wish, not a gap we already felt.", tone: "neutral" },
    ],
  },
  "mad-sad-glad": {
    name: "Mad, sad, glad",
    blurb: "Name the feeling, then the moment in this sprint that caused it.",
    columns: [
      { id: "mad", title: "Mad", hint: "Which moment in this sprint frustrated us?", tone: "bad" },
      { id: "sad", title: "Sad", hint: "What did this sprint disappoint us about, or take away?", tone: "neutral" },
      { id: "glad", title: "Glad", hint: "What in this sprint are we proud of and want to protect next sprint?", tone: "good" },
    ],
  },
  sailboat: {
    name: "Sailboat",
    blurb: "One boat. Wind moved this sprint, anchors dragged it, rocks are the risk ahead, and the island is where the next sprint should land.",
    columns: [
      { id: "wind", title: "Wind", hint: "What pushed this sprint forward? Keep it next sprint.", tone: "good" },
      { id: "anchor", title: "Anchors", hint: "What held this sprint back? Lighten it or cut it next sprint.", tone: "bad" },
      { id: "rocks", title: "Rocks", hint: "What risk is already visible for the next sprint?", tone: "neutral" },
      { id: "island", title: "Island", hint: "What outcome should the next sprint reach?", tone: "idea" },
    ],
  },
  "rose-bud-thorn": {
    name: "Rose, bud, thorn",
    blurb: "One plant from this sprint. The rose bloomed, the thorn scratched us, and the bud needs another sprint.",
    columns: [
      { id: "rose", title: "Rose", hint: "What fully worked this sprint? Repeat it next sprint.", tone: "good" },
      { id: "bud", title: "Bud", hint: "What only started to work this sprint, and needs care next sprint?", tone: "idea" },
      { id: "thorn", title: "Thorn", hint: "What hurt or blocked this sprint? Remove it next sprint.", tone: "bad" },
    ],
  },
  "went-well": {
    name: "Went well, didn't, puzzles",
    blurb: "Wins to repeat, misses to drop, and questions to settle before the next sprint is planned.",
    columns: [
      { id: "well", title: "Went well", hint: "What should we repeat next sprint, the same way?", tone: "good" },
      { id: "didnt", title: "Didn't", hint: "What missed the mark this sprint and should not be repeated?", tone: "bad" },
      { id: "puzzle", title: "Puzzles", hint: "What about this sprint do we still not understand? Settle it before planning the next sprint.", tone: "neutral" },
    ],
  },
  daki: {
    name: "DAKI",
    blurb: "Drop, add, keep, or improve. Four decisions about the same work for the next sprint.",
    columns: [
      { id: "drop", title: "Drop", hint: "Stop carrying this into the next sprint.", tone: "bad" },
      { id: "add", title: "Add", hint: "Bring this into the next sprint. We did not have it this sprint.", tone: "idea" },
      { id: "keep", title: "Keep", hint: "This worked this sprint. Do not change it next sprint.", tone: "good" },
      { id: "improve", title: "Improve", hint: "Keep this next sprint, but change how we do it.", tone: "neutral" },
    ],
  },
  starfish: {
    name: "Starfish",
    blurb: "Five decisions for the next sprint. Less and more change the amount. Stop and start decide whether we do it at all. Keep means do not touch it.",
    columns: [
      { id: "keep", title: "Keep", hint: "This was right this sprint. Continue it unchanged next sprint.", tone: "good" },
      { id: "less", title: "Less", hint: "This helped this sprint, but we did too much of it. Do less next sprint.", tone: "neutral" },
      { id: "more", title: "More", hint: "This helped this sprint, but we did too little of it. Do more next sprint.", tone: "idea" },
      { id: "stop", title: "Stop", hint: "This hurt this sprint. Stop it entirely next sprint.", tone: "bad" },
      { id: "start", title: "Start", hint: "We did not do this sprint, and we should begin next sprint.", tone: "idea" },
    ],
  },
  "star-wars": {
    name: "Star Wars",
    group: "film",
    blurb: "What powered this sprint, what pulled it off course, and what we build next sprint.",
    columns: [
      { id: "force", title: "The Force", hint: "Keep. What gave this sprint its momentum?", tone: "good" },
      { id: "dark", title: "Dark side", hint: "Stop. What pulled this sprint off course?", tone: "bad" },
      { id: "hope", title: "A new hope", hint: "Next. What should we build in the next sprint?", tone: "idea" },
    ],
  },
  superhero: {
    name: "Superhero",
    group: "film",
    blurb: "The strength to keep, the weakness to stop feeding, and the mission for the next sprint.",
    columns: [
      { id: "power", title: "Superpower", hint: "Keep. What did this team do this sprint that we should rely on again?", tone: "good" },
      { id: "kryptonite", title: "Kryptonite", hint: "Stop. What showed up this sprint and made the team weaker?", tone: "bad" },
      { id: "mission", title: "Mission", hint: "Next. What one mission should the next sprint take on?", tone: "idea" },
    ],
  },
  arcade: {
    name: "Arcade",
    group: "games",
    blurb: "What boosted this sprint, what bossed it, and which level we play next sprint.",
    columns: [
      { id: "powerup", title: "Power-up", hint: "Keep. What gave this sprint a boost we should use again?", tone: "good" },
      { id: "boss", title: "Boss fight", hint: "Stop. What fight ate this sprint and should not be fought the same way?", tone: "bad" },
      { id: "level", title: "Next level", hint: "Next. What should the next sprint unlock?", tone: "idea" },
    ],
  },
  premiere: {
    name: "Premiere",
    group: "film",
    blurb: "What is worth running again, what gets no second sprint, and what deserves a sequel.",
    columns: [
      { id: "blockbuster", title: "Blockbuster", hint: "Keep. What from this sprint would we run again, the same way?", tone: "good" },
      { id: "flop", title: "Flop", hint: "Stop. What from this sprint should not get another try?", tone: "bad" },
      { id: "sequel", title: "Sequel", hint: "Next. What deserves a follow-up next sprint, with a change?", tone: "idea" },
    ],
  },
  quest: {
    name: "Quest",
    group: "games",
    blurb: "What we carry out of this sprint, what we stop fighting the same way, and the chapter we write next.",
    columns: [
      { id: "treasure", title: "Treasure", hint: "Keep. What result from this sprint do we carry into the next?", tone: "good" },
      { id: "dragon", title: "Dragon", hint: "Stop. What obstacle ate this sprint?", tone: "bad" },
      { id: "chapter", title: "Next chapter", hint: "Next. What is the next sprint's chapter, in one sentence?", tone: "idea" },
    ],
  },
  race: {
    name: "Race weekend",
    group: "sport",
    blurb: "What we repeat, what forced a slowdown, what did not finish, and what we start first next sprint.",
    columns: [
      { id: "podium", title: "Podium", hint: "Keep. What result from this sprint is worth repeating?", tone: "good" },
      { id: "safety", title: "Safety car", hint: "Name it. What forced this sprint to slow down, and how do we plan for it next sprint?", tone: "neutral" },
      { id: "dnf", title: "Did not finish", hint: "Decide. What did this sprint start and not finish? Finish it next sprint, or drop it.", tone: "bad" },
      { id: "pole", title: "Pole position", hint: "Next. What should we start first next sprint?", tone: "idea" },
    ],
  },
  pokemon: {
    name: "Pokémon",
    group: "anime",
    blurb: "What we caught, the battle we chose, what fainted, and what is ready to evolve next sprint.",
    columns: [
      { id: "caught", title: "Caught", hint: "Keep. What practice did we catch this sprint and want to keep?", tone: "good" },
      { id: "battle", title: "Battle", hint: "Name it. Which fight did this sprint choose, and was it the right one for the next sprint?", tone: "neutral" },
      { id: "fainted", title: "Fainted", hint: "Stop or rest. What ran out of energy this sprint?", tone: "bad" },
      { id: "evolve", title: "Evolve", hint: "Next. What is ready to become a stronger version next sprint?", tone: "idea" },
    ],
  },
  heist: {
    name: "Heist",
    group: "film",
    blurb: "What made this sprint work, what almost blew it, and how we leave for the next one.",
    columns: [
      { id: "crew", title: "The crew", hint: "Keep. Who or what made this sprint work?", tone: "good" },
      { id: "alarm", title: "The alarm", hint: "Stop. What almost blew this sprint?", tone: "bad" },
      { id: "getaway", title: "The getaway", hint: "Next. How do we close this sprint and enter the next one?", tone: "idea" },
    ],
  },
  noir: {
    name: "Noir",
    group: "film",
    blurb: "One case about this sprint: the fact we keep, the distraction we drop, and the conclusion we act on next.",
    columns: [
      { id: "clue", title: "Clue", hint: "Keep. Which fact from this sprint should guide the next one?", tone: "good" },
      { id: "herring", title: "Red herring", hint: "Stop. What did we treat as important this sprint that was not?", tone: "bad" },
      { id: "reveal", title: "The reveal", hint: "Next. What will we do next sprint with what we now understand?", tone: "idea" },
    ],
  },
  concert: {
    name: "Concert",
    group: "music",
    blurb: "What we play again, what was off this sprint, and the setlist for the next one.",
    columns: [
      { id: "encore", title: "Encore", hint: "Keep. What should we play again next sprint, the same way?", tone: "good" },
      { id: "sour", title: "Sour note", hint: "Stop. What was off this sprint?", tone: "bad" },
      { id: "setlist", title: "Setlist", hint: "Next. What belongs on the next sprint's list?", tone: "idea" },
    ],
  },
  wizarding: {
    name: "Wizarding",
    group: "film",
    blurb: "What worked easily, what curse kept returning, and the outcome the next sprint commits to.",
    columns: [
      { id: "spell", title: "Spell", hint: "Keep. What worked so well this sprint that it felt easy?", tone: "good" },
      { id: "curse", title: "Curse", hint: "Stop. What kept coming back and hurting this sprint?", tone: "bad" },
      { id: "prophecy", title: "Prophecy", hint: "Next. What outcome is the next sprint committing to?", tone: "idea" },
    ],
  },
  streaming: {
    name: "Streaming",
    group: "series",
    blurb: "What is worth doing again, what we skip next sprint, and what that sprint should deliver.",
    columns: [
      { id: "binge", title: "Worth another watch", hint: "Keep. What from this sprint would we happily do again?", tone: "good" },
      { id: "skip", title: "Skip", hint: "Stop. What should we skip next sprint?", tone: "bad" },
      { id: "soon", title: "Coming soon", hint: "Next. What should the next sprint actually deliver?", tone: "idea" },
    ],
  },
  marvel: {
    name: "Marvel",
    group: "film",
    blurb: "What we did better together, what wiped progress out, and the plan that finishes it next sprint.",
    columns: [
      { id: "assemble", title: "Assemble", hint: "Keep. What did we do better this sprint because we did it together?", tone: "good" },
      { id: "snap", title: "Wiped out", hint: "Stop. What wiped out progress this sprint that we still needed?", tone: "bad" },
      { id: "endgame", title: "Endgame", hint: "Next. What one play finishes what this sprint left open?", tone: "idea" },
    ],
  },
  dc: {
    name: "DC",
    group: "film",
    blurb: "The call we answered, what we left in the dark, and the backup the next sprint needs.",
    columns: [
      { id: "signal", title: "The signal", hint: "Keep. What clear call did this sprint make, and who answered it?", tone: "good" },
      { id: "gotham", title: "In the dark", hint: "Stop. What confusion or risk did this sprint leave unresolved?", tone: "bad" },
      { id: "league", title: "Call backup", hint: "Next. What help or skill should the next sprint bring in?", tone: "idea" },
    ],
  },
  "harry-potter": {
    name: "Harry Potter",
    group: "film",
    blurb: "What protected this sprint, what drained it, and the problem that is still alive next sprint.",
    columns: [
      { id: "patronus", title: "Patronus", hint: "Keep. What protected the team when this sprint got hard?", tone: "good" },
      { id: "dementor", title: "Dementor", hint: "Stop. What drained energy from this sprint?", tone: "bad" },
      { id: "horcrux", title: "Horcrux", hint: "Next. What problem survived this sprint and must be dealt with next?", tone: "idea" },
    ],
  },
  "breaking-bad": {
    name: "Breaking Bad",
    group: "series",
    blurb: "Work at the quality we want again, what spoiled it, and how the next sprint finishes clean.",
    columns: [
      { id: "sky", title: "Pure batch", hint: "Keep. What work this sprint came out at the quality we want again?", tone: "good" },
      { id: "contaminate", title: "Contamination", hint: "Stop. What spoiled otherwise good work this sprint?", tone: "bad" },
      { id: "exit", title: "Clean exit", hint: "Next. How does the next sprint finish without this mess?", tone: "idea" },
    ],
  },
  "criminal-minds": {
    name: "Criminal Minds",
    group: "series",
    blurb: "The pattern we will reuse, the hidden problem we will stop, and the case the next sprint takes on purpose.",
    columns: [
      { id: "profile", title: "Profile", hint: "Keep. What pattern from this sprint do we finally understand and should use?", tone: "good" },
      { id: "unsub", title: "Still hiding", hint: "Stop. What hidden problem kept hurting this sprint?", tone: "bad" },
      { id: "casefile", title: "Next case", hint: "Next. What problem will we take on deliberately next sprint?", tone: "idea" },
    ],
  },
  ncis: {
    name: "NCIS",
    group: "series",
    blurb: "What this sprint proved, the thread we dropped, and the one rule the next sprint will follow.",
    columns: [
      { id: "evidence", title: "Evidence", hint: "Keep. What did this sprint prove, so we do not relearn it?", tone: "good" },
      { id: "cold", title: "Dropped thread", hint: "Stop. What did this sprint let go quiet that still matters?", tone: "bad" },
      { id: "rule", title: "The rule", hint: "Next. What one rule will this team follow next sprint?", tone: "idea" },
    ],
  },
  "one-piece": {
    name: "One Piece",
    group: "anime",
    blurb: "What the crew carries forward, what knocked this sprint off course, and the one destination next.",
    columns: [
      { id: "treasure", title: "Treasure", hint: "Keep. What result from this sprint is worth carrying forward?", tone: "good" },
      { id: "storm", title: "Storm", hint: "Stop. What knocked this sprint off course?", tone: "bad" },
      { id: "island", title: "Next island", hint: "Next. What is the one destination for the next sprint?", tone: "idea" },
    ],
  },
  naruto: {
    name: "Naruto",
    group: "anime",
    blurb: "The teamwork we keep, what we avoided and it cost us, and the mission we accept next.",
    columns: [
      { id: "bond", title: "Bond", hint: "Keep. What teamwork held this sprint together?", tone: "good" },
      { id: "shadow", title: "Avoided", hint: "Stop. What did we avoid this sprint, and what did that cost?", tone: "bad" },
      { id: "scroll", title: "Next mission", hint: "Next. What mission are we accepting for the next sprint?", tone: "idea" },
    ],
  },
  bleach: {
    name: "Bleach",
    group: "anime",
    blurb: "The strength we keep drawing, what emptied this sprint, and the power we have not used yet.",
    columns: [
      { id: "blade", title: "Our blade", hint: "Keep. What strength should we keep using next sprint?", tone: "good" },
      { id: "hollow", title: "Hollow", hint: "Stop. What emptied this sprint of energy?", tone: "bad" },
      { id: "bankai", title: "Unused power", hint: "Next. What strength do we already have, and did not use this sprint?", tone: "idea" },
    ],
  },
  lotr: {
    name: "Lord of the Rings",
    group: "film",
    blurb: "Who carried this sprint, the burden we put down, and the next stretch of road.",
    columns: [
      { id: "fellowship", title: "Fellowship", hint: "Keep. Who or what carried this sprint?", tone: "good" },
      { id: "ring", title: "The ring", hint: "Stop. What burden should we put down before the next sprint?", tone: "bad" },
      { id: "road", title: "The road", hint: "Next. What is the next stretch of the sprint?", tone: "idea" },
    ],
  },
  "stranger-things": {
    name: "Stranger Things",
    group: "series",
    blurb: "What the group did well, what flipped on us, and the one gate we close before the next sprint.",
    columns: [
      { id: "party", title: "The party", hint: "Keep. What did the group do this sprint that worked?", tone: "good" },
      { id: "upside", title: "Upside Down", hint: "Stop. What flipped this sprint and hurt us?", tone: "bad" },
      { id: "gate", title: "The gate", hint: "Next. What opening from this sprint will we close before the next one?", tone: "idea" },
    ],
  },
  avatar: {
    name: "Avatar",
    group: "series",
    blurb: "Four elements of this sprint. Water adapted, earth held, fire burned, and air is what we practice next.",
    columns: [
      { id: "water", title: "Water", hint: "Keep. What adapted and kept flowing this sprint?", tone: "good" },
      { id: "earth", title: "Earth", hint: "Keep. What foundation held this sprint and should stay?", tone: "good" },
      { id: "fire", title: "Fire", hint: "Stop. What burned time, trust, or quality this sprint?", tone: "bad" },
      { id: "air", title: "Air", hint: "Next. What should the next sprint let move, or practice?", tone: "idea" },
    ],
  },
  sherlock: {
    name: "Sherlock",
    group: "series",
    blurb: "The conclusion we keep, the blind spot we stop ignoring, and the question the next sprint answers.",
    columns: [
      { id: "deduction", title: "Deduction", hint: "Keep. What conclusion does this sprint actually support?", tone: "good" },
      { id: "blind", title: "Blind spot", hint: "Stop. What did we keep missing this sprint?", tone: "bad" },
      { id: "case", title: "Next case", hint: "Next. Which blind spot becomes the question we answer next sprint?", tone: "idea" },
    ],
  },
  "squid-game": {
    name: "Squid Game",
    group: "series",
    blurb: "Green light is what kept us moving. Red light is what froze us. The next game is what we play differently.",
    columns: [
      { id: "circle", title: "Green light", hint: "Keep. What kept this sprint moving, and should move again?", tone: "good" },
      { id: "triangle", title: "Red light", hint: "Stop. What froze this sprint or knocked people out?", tone: "bad" },
      { id: "square", title: "Next game", hint: "Next. What will we play differently next sprint?", tone: "idea" },
    ],
  },
  taco: {
    name: "TACO",
    blurb: "Four looks at the same sprint: how we worked, what we finished, what hurt, and what we should take next.",
    columns: [
      { id: "teamwork", title: "Teamwork", hint: "Keep. How did we work together this sprint, and what should stay?", tone: "good" },
      { id: "accomplishments", title: "Accomplishments", hint: "Keep. What did this sprint actually finish?", tone: "good" },
      { id: "challenges", title: "Challenges", hint: "Stop. What challenge hurt this sprint and should not return the same way?", tone: "bad" },
      { id: "opportunities", title: "Opportunities", hint: "Next. What opportunity should the next sprint take?", tone: "idea" },
    ],
  },
  "4ps": {
    name: "4Ps",
    blurb: "Product, process, people, and the personal need the next sprint can support.",
    columns: [
      { id: "product", title: "Product", hint: "Keep. What about the product worked for the user this sprint?", tone: "good" },
      { id: "process", title: "Process", hint: "Name it. What in the way we worked this sprint should change next sprint?", tone: "neutral" },
      { id: "people", title: "People", hint: "Keep. What about how we treated each other should the next sprint protect?", tone: "good" },
      { id: "personal", title: "Personal", hint: "Next. What does a person need next sprint that the team can support?", tone: "idea" },
    ],
  },
  digimon: {
    name: "Digimon",
    group: "anime",
    blurb: "The partner we keep, the rookie that just started, the form ready to digivolve, and the virus we stop.",
    columns: [
      { id: "partner", title: "Partner", hint: "Keep. What partnered with the team this sprint and should stay?", tone: "good" },
      { id: "rookie", title: "Rookie", hint: "Next. What only just started this sprint and needs another sprint to grow?", tone: "idea" },
      { id: "digivolve", title: "Digivolve", hint: "Next. What is ready to grow into a stronger form next sprint?", tone: "idea" },
      { id: "virus", title: "Virus", hint: "Stop. What corrupted this sprint and should not spread?", tone: "bad" },
    ],
  },
  "star-trek": {
    name: "Star Trek",
    group: "series",
    blurb: "Who held the bridge, what moved at warp, what raised a red alert, and the voyage the next sprint accepts.",
    columns: [
      { id: "bridge", title: "Bridge", hint: "Keep. Who held this sprint together when it moved fast?", tone: "good" },
      { id: "warp", title: "Warp", hint: "Keep. What moved this sprint at speed and should again?", tone: "good" },
      { id: "alert", title: "Red alert", hint: "Stop. What put this sprint in danger?", tone: "bad" },
      { id: "voyage", title: "Next voyage", hint: "Next. What mission should the next sprint accept?", tone: "idea" },
    ],
  },
  f1: {
    name: "F1",
    group: "sport",
    blurb: "A grand prix: the start we earned, the pit stop, the strategy call, the pace, and the result we can claim.",
    columns: [
      { id: "grid", title: "Front row", hint: "Keep. What earned this sprint its start?", tone: "good" },
      { id: "pit", title: "Pit stop", hint: "Stop. What cost this sprint time in the pits?", tone: "bad" },
      { id: "strategy", title: "Strategy", hint: "Name it. Which call this sprint gained or lost us time, and will the next sprint make it again?", tone: "neutral" },
      { id: "pace", title: "Race pace", hint: "Next. What pace should the next sprint hold?", tone: "idea" },
      { id: "flag", title: "Chequered flag", hint: "Keep. What result can this sprint actually claim?", tone: "good" },
    ],
  },
  motogp: {
    name: "MotoGP",
    group: "sport",
    blurb: "One corner: where we braked, the apex we hit, the gravel we slid into, and the slipstream next sprint.",
    columns: [
      { id: "brake", title: "Braking", hint: "Name it. Where did this sprint set up the corner, and what should the next sprint prepare earlier?", tone: "neutral" },
      { id: "apex", title: "Apex", hint: "Keep. What clean line did this sprint hit?", tone: "good" },
      { id: "gravel", title: "Gravel", hint: "Stop. Where did this sprint slide off?", tone: "bad" },
      { id: "draft", title: "Slipstream", hint: "Next. What should the next sprint draft behind?", tone: "idea" },
    ],
  },
  "world-cup": {
    name: "FIFA World Cup",
    group: "sport",
    blurb: "A match: the goal, the assist that set it up, the offside, the card, and what still needs extra time.",
    columns: [
      { id: "goal", title: "Goal", hint: "Keep. What did this sprint actually score?", tone: "good" },
      { id: "assist", title: "Assist", hint: "Keep. What set up the result this sprint, and should set one up again?", tone: "good" },
      { id: "offside", title: "Offside", hint: "Stop. What looked done this sprint but did not count?", tone: "bad" },
      { id: "card", title: "Card", hint: "Stop. Where did this sprint cross a line?", tone: "bad" },
      { id: "extra", title: "Extra time", hint: "Next. What still needs another sprint to finish?", tone: "idea" },
    ],
  },
  mario: {
    name: "Super Mario",
    group: "games",
    blurb: "One level: the coins we collected, the star that protected us, the pit we fell in, the pipe ahead, and the flag we reached.",
    columns: [
      { id: "coin", title: "Coin", hint: "Keep. What small win did this sprint collect, and should collect again?", tone: "good" },
      { id: "star", title: "Super star", hint: "Keep. What made this sprint briefly safe to move fast?", tone: "good" },
      { id: "pit", title: "Pit", hint: "Stop. Where did this sprint fall, and how do we not fall next sprint?", tone: "bad" },
      { id: "pipe", title: "Warp pipe", hint: "Next. What shortcut should the next sprint take?", tone: "idea" },
      { id: "flagpole", title: "Flag", hint: "Keep. What level did this sprint actually clear?", tone: "good" },
    ],
  },
  "marie-kondo": {
    name: "Marie Kondo",
    blurb: "Keep what sparks joy, thank what has finished its job, and let the rest go before the next sprint.",
    columns: [
      { id: "joy", title: "Spark joy", hint: "Keep. What in this sprint sparks joy and should stay?", tone: "good" },
      { id: "thanks", title: "Thank it", hint: "Name it. What did its job this sprint and can be thanked, then released?", tone: "neutral" },
      { id: "discard", title: "Let go", hint: "Stop. What does not earn a place in the next sprint?", tone: "bad" },
    ],
  },
  kalm: {
    name: "KALM",
    blurb: "Keep what works, add what is missing, do less of the excess, and do more of what helped this sprint.",
    columns: [
      { id: "kalm-keep", title: "Keep", hint: "Keep. What should the next sprint leave unchanged?", tone: "good" },
      { id: "kalm-add", title: "Add", hint: "Next. What was missing this sprint and should be added?", tone: "idea" },
      { id: "kalm-less", title: "Less", hint: "Name it. What should the next sprint do less of?", tone: "neutral" },
      { id: "kalm-more", title: "More", hint: "Next. What helped this sprint and deserves more time?", tone: "idea" },
    ],
  },
  alc: {
    name: "ALC",
    blurb: "Appreciations we protect, learnings we will use, and challenges that should not return the same way next sprint.",
    columns: [
      { id: "appreciate", title: "Appreciations", hint: "Keep. Who or what do we appreciate from this sprint?", tone: "good" },
      { id: "alc-learned", title: "Learned", hint: "Next. What did this sprint teach us that the next sprint should use?", tone: "idea" },
      { id: "alc-challenge", title: "Challenges", hint: "Stop. What challenge hurt this sprint and should change next sprint?", tone: "bad" },
    ],
  },
  "mario-kart": {
    name: "Mario Kart",
    group: "games",
    blurb: "One race: the boost, the item we grab, the banana we dropped, the shell that hit us, and the place we finished.",
    columns: [
      { id: "boost", title: "Boost", hint: "Keep. What gave this sprint a burst of speed?", tone: "good" },
      { id: "item", title: "Item box", hint: "Next. What should the next sprint grab before the first lap?", tone: "idea" },
      { id: "banana", title: "Banana", hint: "Stop. What did we drop that spun this sprint out?", tone: "bad" },
      { id: "shell", title: "Shell", hint: "Stop. What hit this sprint from outside?", tone: "bad" },
      { id: "finish", title: "Finish", hint: "Keep. What place did this sprint actually take, and is it worth repeating?", tone: "good" },
    ],
  },
  pacman: {
    name: "Pac-Man",
    group: "games",
    blurb: "Pacman: the pellets, the cherry bonus, the ghost that chased us, and the power pellet for the next sprint.",
    columns: [
      { id: "pellet", title: "Pellet", hint: "Keep. What small win did this sprint collect, and should collect again?", tone: "good" },
      { id: "cherry", title: "Cherry", hint: "Keep. What bonus did this sprint reach, and how do we reach it again?", tone: "good" },
      { id: "ghost", title: "Ghost", hint: "Stop. What chased this sprint and should not chase the next one?", tone: "bad" },
      { id: "power", title: "Power pellet", hint: "Next. What would let the next sprint turn a chase around?", tone: "idea" },
    ],
  },
  pizza: {
    name: "Pizza",
    group: "food",
    blurb: "One pizza: the dough that held, the sauce we shared, the topping to add, the slice we served, and the crust we burned.",
    columns: [
      { id: "dough", title: "Dough", hint: "Keep. What base held this sprint together?", tone: "good" },
      { id: "sauce", title: "Sauce", hint: "Keep. What shared context made this sprint one piece of work?", tone: "good" },
      { id: "topping", title: "Topping", hint: "Next. What should the next sprint add on top of what already works?", tone: "idea" },
      { id: "slice", title: "Slice", hint: "Keep. What finished piece of this sprint can we serve again?", tone: "good" },
      { id: "burnt", title: "Burnt crust", hint: "Stop. What did we leave in too long this sprint?", tone: "bad" },
    ],
  },
  cricket: {
    name: "Cricket",
    group: "sport",
    blurb: "One innings: the opening stand, the partnership, the wicket, the extras that did not count, and the declaration for the next sprint.",
    columns: [
      { id: "opening", title: "Opening stand", hint: "Keep. What opening did this sprint build, and should the next sprint open the same way?", tone: "good" },
      { id: "partnership", title: "Partnership", hint: "Keep. Which partnership held this sprint's innings together?", tone: "good" },
      { id: "wicket", title: "Wicket", hint: "Stop. What wicket fell this sprint, and how do we not lose it next sprint?", tone: "bad" },
      { id: "extras", title: "Extras", hint: "Stop. What extra work this sprint did not count toward the goal?", tone: "bad" },
      { id: "declare", title: "Declaration", hint: "Next. What should the next sprint declare finished and leave behind?", tone: "idea" },
    ],
  },
  basketball: {
    name: "Basketball",
    group: "sport",
    blurb: "One possession: the fast break, the assist, the turnover, the foul, and the next possession this sprint sets up.",
    columns: [
      { id: "fast-break", title: "Fast break", hint: "Keep. What did this sprint score before the defense was set?", tone: "good" },
      { id: "hoop-assist", title: "Assist", hint: "Keep. What pass this sprint set up someone else's score?", tone: "good" },
      { id: "turnover", title: "Turnover", hint: "Stop. What did this sprint give away, and how do we keep it next sprint?", tone: "bad" },
      { id: "foul", title: "Foul", hint: "Stop. Where did this sprint cross a line?", tone: "bad" },
      { id: "possession", title: "Next possession", hint: "Next. What possession should the next sprint take first?", tone: "idea" },
    ],
  },
  "field-hockey": {
    name: "Field Hockey",
    group: "sport",
    blurb: "One attack: entering the circle, the penalty corner, the green card, and the half the next sprint plays.",
    columns: [
      { id: "circle", title: "Circle", hint: "Keep. What did this sprint carry into the circle, close enough to score?", tone: "good" },
      { id: "corner", title: "Penalty corner", hint: "Name it. Which set piece did this sprint earn, and was it worth the stoppage?", tone: "neutral" },
      { id: "green-card", title: "Green card", hint: "Stop. Where did this sprint earn a warning it should not earn next sprint?", tone: "bad" },
      { id: "hockey-half", title: "Next half", hint: "Next. What should the next half, the next sprint, play differently?", tone: "idea" },
    ],
  },
  tennis: {
    name: "Tennis",
    group: "sport",
    blurb: "One set: the ace, the rally, the fault, the break point, and the next set.",
    columns: [
      { id: "ace", title: "Ace", hint: "Keep. What did this sprint win cleanly, without a long rally?", tone: "good" },
      { id: "rally", title: "Rally", hint: "Name it. Which long exchange this sprint was worth staying in?", tone: "neutral" },
      { id: "fault", title: "Fault", hint: "Stop. What unforced error did this sprint serve up?", tone: "bad" },
      { id: "break-point", title: "Break point", hint: "Stop. Where did this sprint lose its own serve?", tone: "bad" },
      { id: "next-set", title: "Next set", hint: "Next. What does the next set, the next sprint, change?", tone: "idea" },
    ],
  },
  volleyball: {
    name: "Volleyball",
    group: "sport",
    blurb: "One rally: the serve, the set, the spike, the net fault, and the next rally.",
    columns: [
      { id: "serve", title: "Serve", hint: "Keep. What clean start did this sprint put in play?", tone: "good" },
      { id: "volley-set", title: "Set", hint: "Keep. What did this sprint place so a teammate could finish it?", tone: "good" },
      { id: "spike", title: "Spike", hint: "Keep. What did this sprint actually finish?", tone: "good" },
      { id: "net", title: "Net", hint: "Stop. Where did this sprint touch the net and lose the rally?", tone: "bad" },
      { id: "next-rally", title: "Next rally", hint: "Next. What should the next rally, the next sprint, do first?", tone: "idea" },
    ],
  },
  "table-tennis": {
    name: "Table Tennis",
    group: "sport",
    blurb: "One point: the serve, the spin we chose, the edge that went out, and the next game.",
    columns: [
      { id: "tt-serve", title: "Serve", hint: "Keep. What short, controlled start did this sprint use?", tone: "good" },
      { id: "spin", title: "Spin", hint: "Name it. Which variation did this sprint put on the work, and did it land?", tone: "neutral" },
      { id: "edge", title: "Edge", hint: "Stop. What looked in this sprint and still went out?", tone: "bad" },
      { id: "tt-next", title: "Next game", hint: "Next. What should the next game, the next sprint, change about the point?", tone: "idea" },
    ],
  },
  baseball: {
    name: "Baseball",
    group: "sport",
    blurb: "One inning: the hit, the home run, the strikeout, the error, and the next inning.",
    columns: [
      { id: "hit", title: "Hit", hint: "Keep. What did this sprint put in play and reach base with?", tone: "good" },
      { id: "homer", title: "Home run", hint: "Keep. What did this sprint clear that we can claim?", tone: "good" },
      { id: "strikeout", title: "Strikeout", hint: "Stop. What did this sprint swing through and miss?", tone: "bad" },
      { id: "field-error", title: "Error", hint: "Stop. What fielding mistake this sprint let a run in?", tone: "bad" },
      { id: "next-inning", title: "Next inning", hint: "Next. What does the next inning, the next sprint, need ready?", tone: "idea" },
    ],
  },
  rugby: {
    name: "Rugby",
    group: "sport",
    blurb: "One score: the try, the conversion, the knock-on, the penalty, and the next half.",
    columns: [
      { id: "try", title: "Try", hint: "Keep. What did this sprint ground over the line?", tone: "good" },
      { id: "conversion", title: "Conversion", hint: "Keep. What did this sprint add after the score so the result held?", tone: "good" },
      { id: "knock-on", title: "Knock-on", hint: "Stop. What did this sprint spill forward and lose?", tone: "bad" },
      { id: "rugby-penalty", title: "Penalty", hint: "Stop. Where did this sprint give the other side field position?", tone: "bad" },
      { id: "rugby-half", title: "Next half", hint: "Next. What should the next half, the next sprint, keep in hand?", tone: "idea" },
    ],
  },
  golf: {
    name: "Golf",
    group: "sport",
    blurb: "One hole: the birdie under the plan, the par we met, the bunker, the hazard, and the next hole.",
    columns: [
      { id: "birdie", title: "Birdie", hint: "Keep. Where did this sprint beat the plan?", tone: "good" },
      { id: "par", title: "Par", hint: "Name it. Where did this sprint meet the plan and need nothing more?", tone: "neutral" },
      { id: "bunker", title: "Bunker", hint: "Stop. Where did this sprint get stuck short of the green?", tone: "bad" },
      { id: "hazard", title: "Hazard", hint: "Stop. Where did this sprint lose the ball entirely?", tone: "bad" },
      { id: "next-hole", title: "Next hole", hint: "Next. What club should the next hole, the next sprint, take first?", tone: "idea" },
    ],
  },
  olympics: {
    name: "Olympics",
    group: "sport",
    blurb: "One Games: the gold we can claim, the personal best, the false start, the disqualification, and the next Games.",
    columns: [
      { id: "gold", title: "Gold", hint: "Keep. What result from this sprint can we claim as the best we have done?", tone: "good" },
      { id: "personal-best", title: "Personal best", hint: "Keep. Where did this sprint beat our own previous mark?", tone: "good" },
      { id: "false-start", title: "False start", hint: "Stop. Where did this sprint leave before it was ready?", tone: "bad" },
      { id: "dq", title: "Disqualified", hint: "Stop. Where did this sprint break a rule and lose the result?", tone: "bad" },
      { id: "next-games", title: "Next Games", hint: "Next. What should the next Games, the next sprint, train before it competes?", tone: "idea" },
    ],
  },
  esports: {
    name: "eSports",
    group: "games",
    blurb: "One series: the draft we prepared, the execute we landed, the throw we gave back, and the next map.",
    columns: [
      { id: "draft", title: "Draft", hint: "Keep. What did this sprint pick before play started, and should the next sprint pick it again?", tone: "good" },
      { id: "execute", title: "Execute", hint: "Keep. Which play did this sprint call and actually land?", tone: "good" },
      { id: "throw", title: "Throw", hint: "Stop. Where did this sprint give back a lead it already had?", tone: "bad" },
      { id: "next-map", title: "Next map", hint: "Next. What should the next map, the next sprint, ban or pick first?", tone: "idea" },
    ],
  },
  dota: {
    name: "DOTA",
    group: "games",
    blurb: "A Dota match: the lane, the last hits, the feed, the throw, and the ancient the next sprint takes. DOTA.",
    columns: [
      { id: "laning", title: "Laning", hint: "Keep. Which lane did this sprint win in the early game?", tone: "good" },
      { id: "last-hit", title: "Last hit", hint: "Keep. Which small last hit did this sprint secure instead of leaving it?", tone: "good" },
      { id: "feed", title: "Feed", hint: "Stop. Where did this sprint die and hand gold to the other side?", tone: "bad" },
      { id: "dota-throw", title: "Throw", hint: "Stop. Where did this sprint throw a lead late in the match?", tone: "bad" },
      { id: "ancient", title: "Ancient", hint: "Next. What ancient, the real objective, should the next sprint take?", tone: "idea" },
    ],
  },
  "resident-evil": {
    name: "Resident Evil",
    group: "games",
    blurb: "One mansion loop: the save room, the puzzle, the infection, the ambush, and the escape into the next sprint.",
    columns: [
      { id: "save-room", title: "Save room", hint: "Keep. What checkpoint did this sprint earn that we can return to?", tone: "good" },
      { id: "puzzle", title: "Puzzle", hint: "Name it. Which lock did this sprint solve, and which lock is still closed?", tone: "neutral" },
      { id: "infection", title: "Infection", hint: "Stop. What spread this sprint and should be contained next sprint?", tone: "bad" },
      { id: "ambush", title: "Ambush", hint: "Stop. What surprised this sprint because we opened the door unready?", tone: "bad" },
      { id: "escape", title: "Escape", hint: "Next. What route should the next sprint take out of this room?", tone: "idea" },
    ],
  },
  "assassins-creed": {
    name: "Assassin's Creed",
    group: "games",
    blurb: "Assassin Creeds for this sprint: blend, leap, stop the detection, and name the next contract. Assassins Creed.",
    columns: [
      { id: "blend", title: "Blend", hint: "Keep. Where did this sprint disappear into the crowd and still get the work done?", tone: "good" },
      { id: "leap", title: "Leap", hint: "Keep. Which leap of faith this sprint landed because we had looked first?", tone: "good" },
      { id: "detection", title: "Detection", hint: "Stop. Where was this sprint seen, and how do we stay hidden next sprint?", tone: "bad" },
      { id: "contract", title: "Next contract", hint: "Next. Which contract should the next sprint accept, and which should it refuse?", tone: "idea" },
    ],
  },
};

const COLUMN_MARKS: Record<string, string> = {
  "start-stop-continue:start": "🌱",
  "start-stop-continue:stop": "🛑",
  "start-stop-continue:continue": "🔁",
  "4ls:liked": "💛",
  "4ls:learned": "💡",
  "4ls:lacked": "🕳️",
  "4ls:longed": "🌟",
  "mad-sad-glad:mad": "🌩️",
  "mad-sad-glad:sad": "🌧️",
  "mad-sad-glad:glad": "☀️",
  "sailboat:wind": "💨",
  "sailboat:anchor": "⚓",
  "sailboat:rocks": "🪨",
  "sailboat:island": "🏝️",
  "rose-bud-thorn:rose": "🌹",
  "rose-bud-thorn:bud": "🌷",
  "rose-bud-thorn:thorn": "🌵",
  "went-well:well": "✅",
  "went-well:didnt": "❌",
  "went-well:puzzle": "🧩",
  "daki:drop": "📤",
  "daki:add": "➕",
  "daki:keep": "📌",
  "daki:improve": "🔧",
  "starfish:keep": "⭐",
  "starfish:less": "➖",
  "starfish:more": "➕",
  "starfish:stop": "✋",
  "starfish:start": "🚩",
  "star-wars:force": "✨",
  "star-wars:dark": "🌑",
  "star-wars:hope": "🌅",
  "superhero:power": "⚡",
  "superhero:kryptonite": "💎",
  "superhero:mission": "🎯",
  "arcade:powerup": "🍄",
  "arcade:boss": "👾",
  "arcade:level": "🎮",
  "premiere:blockbuster": "🎬",
  "premiere:flop": "🍿",
  "premiere:sequel": "🎞️",
  "quest:treasure": "🧰",
  "quest:dragon": "🐉",
  "quest:chapter": "📖",
  "race:podium": "🏆",
  "race:safety": "🚗",
  "race:dnf": "🏁",
  "race:pole": "🚩",
  "pokemon:caught": "⚪",
  "pokemon:battle": "⚔️",
  "pokemon:fainted": "💫",
  "pokemon:evolve": "🔆",
  "heist:crew": "🎭",
  "heist:alarm": "🚨",
  "heist:getaway": "🚙",
  "noir:clue": "🔍",
  "noir:herring": "🐟",
  "noir:reveal": "👁️",
  "concert:encore": "🎵",
  "concert:sour": "🎶",
  "concert:setlist": "📋",
  "wizarding:spell": "🪄",
  "wizarding:curse": "☠️",
  "wizarding:prophecy": "🔮",
  "streaming:binge": "▶️",
  "streaming:skip": "⏭️",
  "streaming:soon": "📅",
  "marvel:assemble": "🛡️",
  "marvel:snap": "💥",
  "marvel:endgame": "🌀",
  "dc:signal": "🦇",
  "dc:gotham": "🌃",
  "dc:league": "⚖️",
  "harry-potter:patronus": "🦌",
  "harry-potter:dementor": "👻",
  "harry-potter:horcrux": "🖤",
  "breaking-bad:sky": "💎",
  "breaking-bad:contaminate": "🧪",
  "breaking-bad:exit": "🚪",
  "criminal-minds:profile": "🧠",
  "criminal-minds:unsub": "🕵️",
  "criminal-minds:casefile": "📁",
  "ncis:evidence": "🔎",
  "ncis:cold": "🧊",
  "ncis:rule": "📒",
  "one-piece:treasure": "🏴‍☠️",
  "one-piece:storm": "🌊",
  "one-piece:island": "🏝️",
  "naruto:bond": "🍥",
  "naruto:shadow": "👥",
  "naruto:scroll": "📜",
  "bleach:blade": "⚔️",
  "bleach:hollow": "👹",
  "bleach:bankai": "🔥",
  "lotr:fellowship": "🧝",
  "lotr:ring": "💍",
  "lotr:road": "🥾",
  "stranger-things:party": "🚲",
  "stranger-things:upside": "🔺",
  "stranger-things:gate": "🚪",
  "avatar:water": "💧",
  "avatar:earth": "🪨",
  "avatar:fire": "🔥",
  "avatar:air": "🌬️",
  "sherlock:deduction": "🔍",
  "sherlock:blind": "🙈",
  "sherlock:case": "🎩",
  "squid-game:circle": "🟢",
  "squid-game:triangle": "🔴",
  "squid-game:square": "⏭️",
  "taco:teamwork": "🤝",
  "taco:accomplishments": "🏆",
  "taco:challenges": "⛰️",
  "taco:opportunities": "🚪",
  "4ps:product": "📦",
  "4ps:process": "🔄",
  "4ps:people": "👥",
  "4ps:personal": "🌱",
  "digimon:partner": "🤝",
  "digimon:rookie": "🥚",
  "digimon:digivolve": "✨",
  "digimon:virus": "🦠",
  "star-trek:bridge": "🛰️",
  "star-trek:warp": "🚀",
  "star-trek:alert": "🔴",
  "star-trek:voyage": "🖖",
  "f1:grid": "🏎️",
  "f1:pit": "🔧",
  "f1:strategy": "📋",
  "f1:pace": "🏁",
  "f1:flag": "🏴",
  "motogp:brake": "🛑",
  "motogp:apex": "🏍️",
  "motogp:gravel": "🪨",
  "motogp:draft": "💨",
  "world-cup:goal": "⚽",
  "world-cup:assist": "👟",
  "world-cup:offside": "🚩",
  "world-cup:card": "🟨",
  "world-cup:extra": "⏱️",
  "mario:coin": "🪙",
  "mario:star": "⭐",
  "mario:pit": "🕳️",
  "mario:pipe": "🟢",
  "mario:flagpole": "🚩",
  "marie-kondo:joy": "✨",
  "marie-kondo:thanks": "🙏",
  "marie-kondo:discard": "📤",
  "kalm:kalm-keep": "📌",
  "kalm:kalm-add": "➕",
  "kalm:kalm-less": "➖",
  "kalm:kalm-more": "🔼",
  "alc:appreciate": "💛",
  "alc:alc-learned": "💡",
  "alc:alc-challenge": "⛰️",
  "mario-kart:boost": "⚡",
  "mario-kart:banana": "🍌",
  "mario-kart:shell": "🐚",
  "mario-kart:item": "🎁",
  "mario-kart:finish": "🏁",
  "pacman:pellet": "🟡",
  "pacman:cherry": "🍒",
  "pacman:ghost": "👻",
  "pacman:power": "⚪",
  "pizza:dough": "🍞",
  "pizza:sauce": "🍅",
  "pizza:slice": "🍕",
  "pizza:topping": "🧀",
  "pizza:burnt": "🔥",
  "cricket:opening": "🏏",
  "cricket:partnership": "🤝",
  "cricket:wicket": "🪵",
  "cricket:extras": "➕",
  "cricket:declare": "📣",
  "basketball:fast-break": "🏃",
  "basketball:hoop-assist": "🏀",
  "basketball:turnover": "↩️",
  "basketball:foul": "✋",
  "basketball:possession": "🎯",
  "field-hockey:circle": "⭕",
  "field-hockey:corner": "📐",
  "field-hockey:green-card": "🟩",
  "field-hockey:hockey-half": "⏯️",
  "tennis:ace": "🎾",
  "tennis:rally": "〰️",
  "tennis:fault": "❌",
  "tennis:break-point": "💔",
  "tennis:next-set": "🎖️",
  "volleyball:serve": "🏐",
  "volleyball:volley-set": "🙌",
  "volleyball:spike": "💥",
  "volleyball:net": "🥅",
  "volleyball:next-rally": "🔄",
  "table-tennis:tt-serve": "🏓",
  "table-tennis:spin": "🌀",
  "table-tennis:edge": "📏",
  "table-tennis:tt-next": "🎮",
  "baseball:hit": "⚾",
  "baseball:homer": "💨",
  "baseball:strikeout": "🅚",
  "baseball:field-error": "🧤",
  "baseball:next-inning": "⏭️",
  "rugby:try": "🏉",
  "rugby:conversion": "🥅",
  "rugby:knock-on": "🤲",
  "rugby:rugby-penalty": "🚩",
  "rugby:rugby-half": "⏯️",
  "golf:birdie": "🐦",
  "golf:par": "⛳",
  "golf:bunker": "🏖️",
  "golf:hazard": "💧",
  "golf:next-hole": "🕳️",
  "olympics:gold": "🥇",
  "olympics:personal-best": "📈",
  "olympics:false-start": "🚦",
  "olympics:dq": "🚫",
  "olympics:next-games": "🏛️",
  "esports:draft": "🎮",
  "esports:execute": "🎯",
  "esports:throw": "💸",
  "esports:next-map": "🗺️",
  "dota:laning": "🛡️",
  "dota:last-hit": "💰",
  "dota:feed": "💀",
  "dota:dota-throw": "📉",
  "dota:ancient": "🏰",
  "resident-evil:save-room": "💾",
  "resident-evil:puzzle": "🧩",
  "resident-evil:infection": "🧟",
  "resident-evil:ambush": "🚪",
  "resident-evil:escape": "🏃",
  "assassins-creed:blend": "🫥",
  "assassins-creed:leap": "🦅",
  "assassins-creed:detection": "👁️",
  "assassins-creed:contract": "📜",
};

export function columnMark(templateId: string, columnId: string): string {
  return COLUMN_MARKS[`${templateId}:${columnId}`] ?? "•";
}

export function columnsFor(templateId: RetroTemplateId): RetroColumn[] {
  return RETRO_TEMPLATES[templateId].columns.map((column) => ({ ...column }));
}

/** Shape picker order: A to Z by the name the room sees. */
function retroTemplateIds(): RetroTemplateId[] {
  return (Object.keys(RETRO_TEMPLATES) as RetroTemplateId[]).sort((left, right) =>
    RETRO_TEMPLATES[left].name.localeCompare(RETRO_TEMPLATES[right].name, "en", {
      sensitivity: "base",
      numeric: true,
    }),
  );
}

/** Column counts that exist on at least one shape, smallest first. */
export function retroColumnCounts(): number[] {
  const counts = new Set(
    (Object.keys(RETRO_TEMPLATES) as RetroTemplateId[]).map((id) => RETRO_TEMPLATES[id].columns.length),
  );
  return [...counts].sort((left, right) => left - right);
}

export interface RetroTemplateQuery {
  group?: RetroTemplateGroup;
  columns?: number;
}

const COLUMN_COUNT_WORDS: Record<string, number> = {
  three: 3,
  four: 4,
  five: 5,
};

/** "4", "4 columns", "4-column", and "five" are a column-count search. */
function columnCountFromQuery(needle: string): number | null {
  const match = /^(three|four|five|\d+)\s*-?\s*(columns?|cols?)?$/.exec(needle);
  const token = match?.[1];
  if (!token) return null;
  const count = COLUMN_COUNT_WORDS[token] ?? Number(token);
  if (!Number.isInteger(count) || count < 1 || count > 12) return null;
  return count;
}

/**
 * Match a shape by its name, blurb, column titles, theme shelf, or column count.
 * An empty query returns every shape, A to Z. Shelf and column filters narrow that list.
 */
export function searchRetroTemplates(query: string, filters: RetroTemplateQuery = {}): RetroTemplateId[] {
  const needle = query.trim().toLocaleLowerCase();
  const ordered = retroTemplateIds();
  const askedCount = needle ? columnCountFromQuery(needle) : null;
  return ordered.filter((id) => {
    const template = RETRO_TEMPLATES[id];
    const groupId = template.group ?? "classic";
    if (filters.group && groupId !== filters.group) return false;
    if (filters.columns != null && template.columns.length !== filters.columns) return false;
    if (!needle) return true;
    if (askedCount != null && template.columns.length === askedCount) return true;
    const group = RETRO_TEMPLATE_GROUPS.find((item) => item.id === groupId);
    const haystack = [
      template.name,
      template.blurb,
      ...template.columns.map((column) => column.title),
      group?.title ?? "",
      groupId,
    ]
      .join("\n")
      .toLocaleLowerCase();
    return haystack.includes(needle);
  });
}

interface ReviewSeedItem {
  id: string;
  label: string;
  detail: string;
  required?: boolean;
}

interface ReviewSeedSection {
  id: string;
  title: string;
  intent: string;
  /** Facilitation steps. Shown in the room. Not a second checklist. */
  how: string[];
  items: ReviewSeedItem[];
}

const REVIEW_SECTIONS: ReviewSeedSection[] = [
  {
    id: "sprint-goal",
    title: "Sprint Goal",
    intent: "Inspect the Sprint against the goal the team committed to, and against the Product Goal.",
    how: [
      "Read the Sprint Goal out loud before anyone opens a screen.",
      "Say whether it was met, partly met, or missed, and what that means for the Product Goal.",
      "Name work that is not Done. It is not part of the Increment.",
    ],
    items: [
      {
        id: "goal-visible",
        label: "The Sprint Goal is read before the Increment is shown",
        detail: "The room inspects the goal first. The demo comes after.",
        required: true,
      },
      {
        id: "outcome-stated",
        label: "Progress toward the Product Goal is discussed",
        detail: "Say what is more true for users or the business because of this Sprint.",
        required: true,
      },
      {
        id: "undone",
        label: "Work that is not Done is named, and it is not presented as the Increment",
        detail: "Unfinished items return to the Product Backlog. They are not a silent carry-over.",
        required: true,
      },
    ],
  },
  {
    id: "increment",
    title: "Increment",
    intent: "Show the working product. Only what meets the Definition of Done.",
    how: [
      "Walk the real user path in an environment a stakeholder can trust.",
      "Show the check that made each item Done. Skip a ticket-by-ticket status.",
      "If it does not meet the Definition of Done, leave it out of the Increment.",
      "Disclose bugs a user can hit, including severity.",
    ],
    items: [
      {
        id: "dod",
        label: "Everything shown meets the Definition of Done",
        detail: "Done means the team's Definition of Done, not 'demoable on a laptop'.",
        required: true,
      },
      {
        id: "journey",
        label: "The walkthrough follows a user path from trigger to outcome",
        detail: "Start where the user starts. End at the result the Sprint Goal named.",
        required: true,
      },
      {
        id: "environment",
        label: "Stakeholders can see the same environment the team is inspecting",
        detail: "Use a shared environment. A local-only build hides the real Increment.",
      },
      {
        id: "acceptance",
        label: "The acceptance check is visible with what is shown",
        detail: "The room sees why it is Done, not only the screen.",
      },
      {
        id: "bugs",
        label: "Known bugs and incidents are disclosed",
        detail: "Say the severity and whether a user can hit them.",
        required: true,
      },
      {
        id: "quality-bar",
        label: "Quality checks that this Increment needs were run",
        detail: "Accessibility, analytics, privacy, or performance, for the change that shipped.",
      },
    ],
  },
  {
    id: "stakeholders",
    title: "Stakeholders",
    intent: "A working session with the people who can judge the outcome. Not a slide reading.",
    how: [
      "Invite people who feel the change: users, support, sales, or a clear proxy.",
      "Ask what changed in their environment: market, policy, season, or a new constraint.",
      "Ask what they would do next. Write the answer in the room.",
      "Show a metric only when this Sprint could have moved it.",
    ],
    items: [
      {
        id: "stakeholders",
        label: "Key stakeholders are in the room and can judge the outcome",
        detail: "The people affected collaborate. A status meeting to the team alone is not a Sprint Review.",
        required: true,
      },
      {
        id: "metrics",
        label: "Useful evidence of the Sprint Goal is on screen",
        detail: "Only numbers this Sprint could move. Skip a dashboard that does not serve the conversation.",
      },
      {
        id: "feedback-live",
        label: "Stakeholder comments are captured before people leave",
        detail: "Praise, a change, or a question stays on the board.",
        required: true,
      },
      {
        id: "notes",
        label: "What changed in the environment is written down",
        detail: "A market, policy, or user shift belongs in the notes for the Product Owner.",
      },
    ],
  },
  {
    id: "adapt",
    title: "Adapt the backlog",
    intent: "The Product Owner adjusts the Product Backlog from what the room just learned.",
    how: [
      "Product Owner reorders or adds items while everyone is still here.",
      "A new request becomes a Product Backlog item. It is not a promise for the next Sprint.",
      "Decide whether the Increment can be released, the backlog should change, or release should wait.",
      "Leave a Product Backlog the next Sprint Planning can select from.",
    ],
    items: [
      {
        id: "scope",
        label: "New requests are Product Backlog items, not silent Sprint promises",
        detail: "Write them down. Ordering happens on the Product Backlog.",
      },
      {
        id: "backlog",
        label: "The Product Backlog is adjusted before the room closes",
        detail: "Order, add, or drop items to meet what the Review just learned.",
        required: true,
      },
      {
        id: "decision-made",
        label: "The room records release, adapt, or hold",
        detail: "Release means the Increment can go out. Adapt means the Product Goal holds and the backlog changes. Hold means do not release yet.",
        required: true,
      },
    ],
  },
];

const PLANNING_SECTIONS: ReviewSeedSection[] = [
  {
    id: "why",
    title: "Why this Sprint is valuable",
    intent: "The Product Owner proposes value. The Scrum Team writes a Sprint Goal before Planning ends.",
    how: [
      "Product Owner speaks first: whose problem gets better, and how that serves the Product Goal.",
      "The whole Scrum Team writes one Sprint Goal. It is an outcome stakeholders can repeat.",
      "Check that the Sprint Review will be able to inspect this goal.",
      "Finish the Sprint Goal before Planning ends. The goal is the commitment.",
    ],
    items: [
      {
        id: "why-value",
        label: "The Product Owner has said how this Sprint increases value",
        detail: "Value comes before the item list.",
        required: true,
      },
      {
        id: "why-goal",
        label: "The Sprint Goal is one sentence and is final",
        detail: "The Scrum Team owns the wording. A list of tickets is not a Sprint Goal.",
        required: true,
      },
      {
        id: "why-product",
        label: "The Sprint Goal serves the Product Goal",
        detail: "If it does not, choose a different goal.",
      },
      {
        id: "why-inspect",
        label: "The team can say how the Sprint Review will inspect this goal",
        detail: "Name the demo or the evidence that will show the goal was met.",
      },
    ],
  },
  {
    id: "what",
    title: "What can be Done this Sprint",
    intent: "Developers select Product Backlog items. The selection is a forecast.",
    how: [
      "Start at the top of the ordered Product Backlog. Developers pull the next item.",
      "The Product Owner clarifies. The Product Owner does not assign the work.",
      "Count who is actually here: leave, support duty, and events already on the calendar.",
      "Select only items the Developers believe they can bring to the Definition of Done.",
      "Stop when the forecast is full. The next item stays on the Product Backlog.",
    ],
    items: [
      {
        id: "what-pull",
        label: "Developers selected the items",
        detail: "Selection is a pull from the ordered backlog, not an assignment.",
        required: true,
      },
      {
        id: "what-dod",
        label: "Each selected item can meet the Definition of Done in this Sprint",
        detail: "If it cannot, it is not selected. Refine it or leave it.",
        required: true,
      },
      {
        id: "what-capacity",
        label: "The forecast fits past performance and who is here",
        detail: "Include support, meetings, and known leave.",
        required: true,
      },
      {
        id: "what-cut",
        label: "The team can say why the next item was not selected",
        detail: "The cut is part of the forecast.",
      },
    ],
  },
  {
    id: "how",
    title: "How the work will get done",
    intent: "Developers plan the selected work. The plan is theirs.",
    how: [
      "For each selected item, Developers break the work into pieces of about a day or less.",
      "Plan the first days in the room. Later days can stay coarser.",
      "Name a dependency and the person outside the team who must act.",
      "The Product Owner may clarify a trade-off. Developers decide the plan.",
    ],
    items: [
      {
        id: "how-plan",
        label: "Developers have a plan for the first selected items",
        detail: "The plan is how the Increment will meet the Definition of Done.",
        required: true,
      },
      {
        id: "how-days",
        label: "The opening days are clear enough to start",
        detail: "Tomorrow's work is visible. The rest of the Sprint can emerge.",
        required: true,
      },
      {
        id: "how-deps",
        label: "Dependencies have an owner and a needed-by time",
        detail: "A blocker with no owner still blocks the Sprint Goal.",
      },
      {
        id: "how-risk",
        label: "A risk to the Sprint Goal is named, with a signal",
        detail: "Say what the team will watch, and when they will adapt the plan.",
      },
    ],
  },
  {
    id: "forecast",
    title: "Sprint Backlog",
    intent: "The Sprint Goal, the selected items, and the plan together are the Sprint Backlog.",
    how: [
      "Read the Sprint Goal once more. Every selected item should serve it.",
      "Put the goal, the items, and the plan where the team will see them at the Daily Scrum.",
      "Record Forecast, Narrow, or No goal. The forecast can change. The Sprint Goal should not.",
      "If the Sprint Goal is not final, do not start the Sprint.",
    ],
    items: [
      {
        id: "forecast-backlog",
        label: "The Sprint Backlog shows the goal, the selected items, and the plan",
        detail: "Those three parts are the Sprint Backlog. A goal alone is not enough.",
        required: true,
      },
      {
        id: "forecast-owners",
        label: "The Developers who will do the work agree the forecast",
        detail: "Agreement is on the Sprint Goal and a realistic forecast, not a promise that every item finishes.",
        required: true,
      },
      {
        id: "forecast-call",
        label: "The room records Forecast, Narrow, or No goal",
        detail: "Forecast: the goal is set and the selection is a forecast. Narrow: the goal stays and fewer items are selected. No goal: Planning is not finished.",
        required: true,
      },
    ],
  },
];

const REFINEMENT_SECTIONS: ReviewSeedSection[] = [
  {
    id: "detail",
    title: "Detail",
    intent: "Add a description the Developers can understand. Refinement is ongoing. It is not Sprint Planning.",
    how: [
      "Pick one Product Backlog item. Name the user and the outcome that becomes true.",
      "Product Owner explains why it matters for the Product Goal.",
      "Write acceptance criteria a tester can fail.",
      "List each open question with an owner. Leave the question on the item until it is answered.",
    ],
    items: [
      {
        id: "detail-user",
        label: "The user and the outcome are written on the item",
        detail: "A Developer who missed the conversation can still see who benefits.",
        required: true,
      },
      {
        id: "detail-criteria",
        label: "Acceptance criteria are written",
        detail: "Done is visible from the item. It does not depend on memory.",
        required: true,
      },
      {
        id: "detail-questions",
        label: "Open questions have an owner",
        detail: "An unanswered question means the item is not transparent yet.",
        required: true,
      },
      {
        id: "detail-goal",
        label: "The item serves the Product Goal",
        detail: "If nobody can say which goal it serves, it waits.",
      },
    ],
  },
  {
    id: "decompose",
    title: "Split",
    intent: "Break down items that cannot be Done in one Sprint.",
    how: [
      "Ask: can the Scrum Team make this Done in one Sprint? If not, split it.",
      "Split along a user step or a thin slice of value.",
      "Do not split into layers such as frontend and backend. Each piece should still be valuable.",
      "Write what this piece will not include. Give each new piece its own description.",
    ],
    items: [
      {
        id: "split-size",
        label: "The item can be Done in one Sprint, or it is split",
        detail: "An item that cannot finish in a Sprint is not ready for selection.",
        required: true,
      },
      {
        id: "split-value",
        label: "Each smaller item still delivers something a user can recognize",
        detail: "A layer with no user outcome is not a useful split.",
        required: true,
      },
      {
        id: "split-out",
        label: "Out of scope is written on the item",
        detail: "Say what this piece will not do.",
      },
      {
        id: "split-children",
        label: "Oversized items have smaller Product Backlog items",
        detail: "Renaming a large item does not split it.",
      },
    ],
  },
  {
    id: "size",
    title: "Size",
    intent: "Developers who will do the work are responsible for the size.",
    how: [
      "Developers compare the item with one the team has already finished.",
      "Agree a size or a range, and say what would change it.",
      "The Product Owner may explain a trade-off. The Product Owner does not set the size.",
      "Treat the size as a forecast of effort. It is not a delivery date.",
    ],
    items: [
      {
        id: "size-devs",
        label: "Developers set the size",
        detail: "The people who will do the work own the estimate.",
        required: true,
      },
      {
        id: "size-compare",
        label: "The size is compared with a known item",
        detail: "A number with no comparison is hard to forecast from.",
        required: true,
      },
      {
        id: "size-tradeoff",
        label: "Any trade-off from the Product Owner is written down",
        detail: "A smaller outcome can earn a smaller size. Record the exchange.",
      },
    ],
  },
  {
    id: "order",
    title: "Order",
    intent: "The Product Owner orders the Product Backlog. Selectable means Developers could pull it in Planning.",
    how: [
      "Product Owner places the item against the items just above and below it.",
      "Order by value, risk, and learning. Dependencies are a reason, not the whole order.",
      "Name each dependency and who owns it.",
      "Call it Selectable only when it can be Done in one Sprint. Otherwise Split or Return.",
    ],
    items: [
      {
        id: "order-place",
        label: "The item is ordered against its neighbors",
        detail: "The Product Owner can say what comes just before and just after.",
        required: true,
      },
      {
        id: "order-deps",
        label: "Dependencies are named with an owner",
        detail: "A hidden dependency shows up as a surprise in Planning.",
      },
      {
        id: "order-call",
        label: "The item is Selectable, Split, or Return",
        detail: "Selectable: Developers could select it in Sprint Planning. Split: it is still too big. Return: a Product Owner decision is still open.",
        required: true,
      },
      {
        id: "order-next",
        label: "The next item to refine is named",
        detail: "Refinement continues. This session does not have to finish the whole backlog.",
      },
    ],
  },
];

export interface ChecklistDecisionCopy {
  id: ReviewDecision;
  label: string;
  detail: string;
}

export interface ChecklistRitualCopy {
  eyebrow: string;
  headline: string;
  lede: string;
  goalLabel: string;
  goalPlaceholder: string;
  goalHint: string;
  progressLabel: string;
  decisionHeading: string;
  decisionIdle: string;
  decisionNotesLabel: string;
  decisionNotesPlaceholder: string;
  noteLabel: string;
  notePlaceholder: string;
  feedbackLede: string;
  feedbackEmpty: string;
  decisions: ChecklistDecisionCopy[];
}

const CHECKLIST_RITUALS: Record<"review" | "planning" | "refinement", ChecklistRitualCopy> = {
  review: {
    eyebrow: "Sprint review",
    headline: "Inspect the Increment. Adapt the Product Backlog.",
    lede: "Look at what is Done with stakeholders, then change the Product Backlog before people leave.",
    goalLabel: "Sprint Goal being inspected",
    goalPlaceholder: "Paste the Sprint Goal the team committed to.",
    goalHint: "Read this before the Increment is shown",
    progressLabel: "Inspection",
    decisionHeading: "What happens next",
    decisionIdle: "Release, adapt the backlog, or hold.",
    decisionNotesLabel: "What the backlog will change",
    decisionNotesPlaceholder: "What did stakeholders ask for, and how will the Product Backlog change?",
    noteLabel: "What we saw",
    notePlaceholder: "A path you showed, a bug, or a stakeholder comment",
    feedbackLede: "What stakeholders want the Product Owner to hear.",
    feedbackEmpty: "A comment from someone who can judge the outcome.",
    decisions: [
      { id: "ship", label: "Release", detail: "The Increment is Done and can be released." },
      { id: "iterate", label: "Adapt", detail: "The Product Goal holds. The Product Backlog changes." },
      { id: "hold", label: "Hold", detail: "Do not release. Adapt the backlog before more building." },
    ],
  },
  planning: {
    eyebrow: "Sprint planning",
    headline: "Why, what, and how. Then a forecast.",
    lede: "The Sprint Goal is the commitment. The items the Developers select are a forecast.",
    goalLabel: "Sprint Goal",
    goalPlaceholder: "Why is this Sprint valuable to stakeholders?",
    goalHint: "The Scrum Team finalizes this before Planning ends",
    progressLabel: "Planning topics",
    decisionHeading: "Forecast",
    decisionIdle: "Forecast, narrow the selection, or stop because there is no Sprint Goal.",
    decisionNotesLabel: "Forecast notes",
    decisionNotesPlaceholder: "Which items are in, which item was left out, and what could change the plan?",
    noteLabel: "Planning note",
    notePlaceholder: "The value, the selected item, or the plan for the first days",
    feedbackLede: "A trade-off, a risk, or a question about the forecast.",
    feedbackEmpty: "Something the Developers or the Product Owner need on the Sprint Backlog.",
    decisions: [
      { id: "commit", label: "Forecast", detail: "The Sprint Goal is set. The selected items are a forecast." },
      { id: "reshape", label: "Narrow", detail: "The Sprint Goal stays. Developers select fewer items." },
      { id: "defer", label: "No goal", detail: "The Sprint Goal is not final. Do not start the Sprint." },
    ],
  },
  refinement: {
    eyebrow: "Product Backlog refinement",
    headline: "Add detail, size, and order.",
    lede: "This is ongoing work on the Product Backlog. It does not start a Sprint and it does not inspect an Increment.",
    goalLabel: "Item being refined",
    goalPlaceholder: "Which Product Backlog item is in front of the team?",
    goalHint: "One item at a time. The rest of the backlog waits",
    progressLabel: "Transparency",
    decisionHeading: "Ready for selection?",
    decisionIdle: "Selectable, split, or return to the Product Owner.",
    decisionNotesLabel: "What is still unclear",
    decisionNotesPlaceholder: "What would a Developer still need before they could select this?",
    noteLabel: "Item note",
    notePlaceholder: "Acceptance criteria, a split, a size, or an open question",
    feedbackLede: "A question for the Product Owner, or a trade-off for the Developers.",
    feedbackEmpty: "Clarity the item still needs. This is not Sprint feedback.",
    decisions: [
      { id: "ready", label: "Selectable", detail: "Developers could select this in Sprint Planning." },
      { id: "split", label: "Split", detail: "It cannot be Done in one Sprint. Break it down." },
      { id: "park", label: "Return", detail: "A Product Owner decision is still open." },
    ],
  },
};

const CHECKLIST_SECTIONS: Record<"review" | "planning" | "refinement", ReviewSeedSection[]> = {
  review: REVIEW_SECTIONS,
  planning: PLANNING_SECTIONS,
  refinement: REFINEMENT_SECTIONS,
};

export type ChecklistKind = "review" | "planning" | "refinement";

export function isChecklistKind(kind: RoomKind): kind is ChecklistKind {
  return kind === "review" || kind === "planning" || kind === "refinement";
}

export function checklistRitual(kind: RoomKind): ChecklistRitualCopy {
  if (isChecklistKind(kind)) return CHECKLIST_RITUALS[kind];
  return CHECKLIST_RITUALS.review;
}

export function checklistDecisions(kind: RoomKind): ChecklistDecisionCopy[] {
  return checklistRitual(kind).decisions;
}

export function checklistHow(kind: RoomKind, sectionId: string): string[] {
  if (!isChecklistKind(kind)) return [];
  return CHECKLIST_SECTIONS[kind].find((section) => section.id === sectionId)?.how ?? [];
}

function seedChecklist(sections: ReviewSeedSection[]): ReviewState {
  const mapped = sections.map((section) => ({
    id: section.id,
    title: section.title,
    intent: section.intent,
    items: section.items.map((item) => ({
      id: item.id,
      label: item.label,
      detail: item.detail,
      required: Boolean(item.required),
      doneBy: [],
      note: "",
    })),
  }));
  return {
    goal: "",
    decision: null,
    decisionNotes: "",
    feedback: [],
    sections: mapped,
    activeSectionId: mapped[0]?.id ?? "",
    stopwatchMs: {},
    stopwatchRunningSince: null,
  };
}

export function createChecklistState(kind: ChecklistKind): ReviewState {
  return seedChecklist(CHECKLIST_SECTIONS[kind]);
}
