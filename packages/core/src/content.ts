import { LIMITS, type ColumnTone, type IcebreakerPair, type IcebreakerId, type RetroColumn, type RetroTemplateId, type ReviewState, type RoomKind } from "./types";

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
    kind: "review",
    name: "Sprint review",
    promise: "Walk the increment against a shared bar, and record the decision.",
    steps: ["Checklist", "Evidence", "Feedback", "Ship decision"],
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

export type IcebreakerMode = "word" | "choice" | "line" | "sprint" | "note" | "emoji" | "gif" | "draw" | "truths" | "pairs";

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
    how: "Everyone names one nearby object and briefly explains its significance.",
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

export const RETRO_TEMPLATES: Record<
  RetroTemplateId,
  {
    name: string;
    blurb: string;
    group?: "classic" | "pop";
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
    name: "Drop, add, keep, improve",
    blurb: "Four decisions about the same work. Drop it, add it, keep it as it is, or keep it and change it next sprint.",
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
    group: "pop",
    blurb: "What powered this sprint, what pulled it off course, and what we build next sprint.",
    columns: [
      { id: "force", title: "The Force", hint: "Keep. What gave this sprint its momentum?", tone: "good" },
      { id: "dark", title: "Dark side", hint: "Stop. What pulled this sprint off course?", tone: "bad" },
      { id: "hope", title: "A new hope", hint: "Next. What should we build in the next sprint?", tone: "idea" },
    ],
  },
  superhero: {
    name: "Superhero",
    group: "pop",
    blurb: "The strength to keep, the weakness to stop feeding, and the mission for the next sprint.",
    columns: [
      { id: "power", title: "Superpower", hint: "Keep. What did this team do this sprint that we should rely on again?", tone: "good" },
      { id: "kryptonite", title: "Kryptonite", hint: "Stop. What showed up this sprint and made the team weaker?", tone: "bad" },
      { id: "mission", title: "Mission", hint: "Next. What one mission should the next sprint take on?", tone: "idea" },
    ],
  },
  arcade: {
    name: "Arcade",
    group: "pop",
    blurb: "What boosted this sprint, what bossed it, and which level we play next sprint.",
    columns: [
      { id: "powerup", title: "Power-up", hint: "Keep. What gave this sprint a boost we should use again?", tone: "good" },
      { id: "boss", title: "Boss fight", hint: "Stop. What fight ate this sprint and should not be fought the same way?", tone: "bad" },
      { id: "level", title: "Next level", hint: "Next. What should the next sprint unlock?", tone: "idea" },
    ],
  },
  premiere: {
    name: "Premiere",
    group: "pop",
    blurb: "What is worth running again, what gets no second sprint, and what deserves a sequel.",
    columns: [
      { id: "blockbuster", title: "Blockbuster", hint: "Keep. What from this sprint would we run again, the same way?", tone: "good" },
      { id: "flop", title: "Flop", hint: "Stop. What from this sprint should not get another try?", tone: "bad" },
      { id: "sequel", title: "Sequel", hint: "Next. What deserves a follow-up next sprint, with a change?", tone: "idea" },
    ],
  },
  quest: {
    name: "Quest",
    group: "pop",
    blurb: "What we carry out of this sprint, what we stop fighting the same way, and the chapter we write next.",
    columns: [
      { id: "treasure", title: "Treasure", hint: "Keep. What result from this sprint do we carry into the next?", tone: "good" },
      { id: "dragon", title: "Dragon", hint: "Stop. What obstacle ate this sprint?", tone: "bad" },
      { id: "chapter", title: "Next chapter", hint: "Next. What is the next sprint's chapter, in one sentence?", tone: "idea" },
    ],
  },
  race: {
    name: "Race weekend",
    group: "pop",
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
    group: "pop",
    blurb: "What stays on the team, what ran out of energy, and what is ready to grow next sprint.",
    columns: [
      { id: "caught", title: "Caught", hint: "Keep. What practice did we catch this sprint and want to keep?", tone: "good" },
      { id: "fainted", title: "Fainted", hint: "Stop or rest. What ran out of energy this sprint?", tone: "bad" },
      { id: "evolve", title: "Evolve", hint: "Next. What is ready to become a stronger version next sprint?", tone: "idea" },
    ],
  },
  heist: {
    name: "Heist",
    group: "pop",
    blurb: "What made this sprint work, what almost blew it, and how we leave for the next one.",
    columns: [
      { id: "crew", title: "The crew", hint: "Keep. Who or what made this sprint work?", tone: "good" },
      { id: "alarm", title: "The alarm", hint: "Stop. What almost blew this sprint?", tone: "bad" },
      { id: "getaway", title: "The getaway", hint: "Next. How do we close this sprint and enter the next one?", tone: "idea" },
    ],
  },
  noir: {
    name: "Noir",
    group: "pop",
    blurb: "One case about this sprint: the fact we keep, the distraction we drop, and the conclusion we act on next.",
    columns: [
      { id: "clue", title: "Clue", hint: "Keep. Which fact from this sprint should guide the next one?", tone: "good" },
      { id: "herring", title: "Red herring", hint: "Stop. What did we treat as important this sprint that was not?", tone: "bad" },
      { id: "reveal", title: "The reveal", hint: "Next. What will we do next sprint with what we now understand?", tone: "idea" },
    ],
  },
  concert: {
    name: "Concert",
    group: "pop",
    blurb: "What we play again, what was off this sprint, and the setlist for the next one.",
    columns: [
      { id: "encore", title: "Encore", hint: "Keep. What should we play again next sprint, the same way?", tone: "good" },
      { id: "sour", title: "Sour note", hint: "Stop. What was off this sprint?", tone: "bad" },
      { id: "setlist", title: "Setlist", hint: "Next. What belongs on the next sprint's list?", tone: "idea" },
    ],
  },
  wizarding: {
    name: "Wizarding",
    group: "pop",
    blurb: "What worked easily, what curse kept returning, and the outcome the next sprint commits to.",
    columns: [
      { id: "spell", title: "Spell", hint: "Keep. What worked so well this sprint that it felt easy?", tone: "good" },
      { id: "curse", title: "Curse", hint: "Stop. What kept coming back and hurting this sprint?", tone: "bad" },
      { id: "prophecy", title: "Prophecy", hint: "Next. What outcome is the next sprint committing to?", tone: "idea" },
    ],
  },
  streaming: {
    name: "Streaming",
    group: "pop",
    blurb: "What is worth doing again, what we skip next sprint, and what that sprint should deliver.",
    columns: [
      { id: "binge", title: "Worth another watch", hint: "Keep. What from this sprint would we happily do again?", tone: "good" },
      { id: "skip", title: "Skip", hint: "Stop. What should we skip next sprint?", tone: "bad" },
      { id: "soon", title: "Coming soon", hint: "Next. What should the next sprint actually deliver?", tone: "idea" },
    ],
  },
  marvel: {
    name: "Marvel",
    group: "pop",
    blurb: "What we did better together, what wiped progress out, and the plan that finishes it next sprint.",
    columns: [
      { id: "assemble", title: "Assemble", hint: "Keep. What did we do better this sprint because we did it together?", tone: "good" },
      { id: "snap", title: "Wiped out", hint: "Stop. What wiped out progress this sprint that we still needed?", tone: "bad" },
      { id: "endgame", title: "Endgame", hint: "Next. What one play finishes what this sprint left open?", tone: "idea" },
    ],
  },
  dc: {
    name: "DC",
    group: "pop",
    blurb: "The call we answered, what we left in the dark, and the backup the next sprint needs.",
    columns: [
      { id: "signal", title: "The signal", hint: "Keep. What clear call did this sprint make, and who answered it?", tone: "good" },
      { id: "gotham", title: "In the dark", hint: "Stop. What confusion or risk did this sprint leave unresolved?", tone: "bad" },
      { id: "league", title: "Call backup", hint: "Next. What help or skill should the next sprint bring in?", tone: "idea" },
    ],
  },
  "harry-potter": {
    name: "Harry Potter",
    group: "pop",
    blurb: "What protected this sprint, what drained it, and the problem that is still alive next sprint.",
    columns: [
      { id: "patronus", title: "Patronus", hint: "Keep. What protected the team when this sprint got hard?", tone: "good" },
      { id: "dementor", title: "Dementor", hint: "Stop. What drained energy from this sprint?", tone: "bad" },
      { id: "horcrux", title: "Horcrux", hint: "Next. What problem survived this sprint and must be dealt with next?", tone: "idea" },
    ],
  },
  "breaking-bad": {
    name: "Breaking Bad",
    group: "pop",
    blurb: "Work at the quality we want again, what spoiled it, and how the next sprint finishes clean.",
    columns: [
      { id: "sky", title: "Pure batch", hint: "Keep. What work this sprint came out at the quality we want again?", tone: "good" },
      { id: "contaminate", title: "Contamination", hint: "Stop. What spoiled otherwise good work this sprint?", tone: "bad" },
      { id: "exit", title: "Clean exit", hint: "Next. How does the next sprint finish without this mess?", tone: "idea" },
    ],
  },
  "criminal-minds": {
    name: "Criminal Minds",
    group: "pop",
    blurb: "The pattern we will reuse, the hidden problem we will stop, and the case the next sprint takes on purpose.",
    columns: [
      { id: "profile", title: "Profile", hint: "Keep. What pattern from this sprint do we finally understand and should use?", tone: "good" },
      { id: "unsub", title: "Still hiding", hint: "Stop. What hidden problem kept hurting this sprint?", tone: "bad" },
      { id: "casefile", title: "Next case", hint: "Next. What problem will we take on deliberately next sprint?", tone: "idea" },
    ],
  },
  ncis: {
    name: "NCIS",
    group: "pop",
    blurb: "What this sprint proved, the thread we dropped, and the one rule the next sprint will follow.",
    columns: [
      { id: "evidence", title: "Evidence", hint: "Keep. What did this sprint prove, so we do not relearn it?", tone: "good" },
      { id: "cold", title: "Dropped thread", hint: "Stop. What did this sprint let go quiet that still matters?", tone: "bad" },
      { id: "rule", title: "The rule", hint: "Next. What one rule will this team follow next sprint?", tone: "idea" },
    ],
  },
  "one-piece": {
    name: "One Piece",
    group: "pop",
    blurb: "What the crew carries forward, what knocked this sprint off course, and the one destination next.",
    columns: [
      { id: "treasure", title: "Treasure", hint: "Keep. What result from this sprint is worth carrying forward?", tone: "good" },
      { id: "storm", title: "Storm", hint: "Stop. What knocked this sprint off course?", tone: "bad" },
      { id: "island", title: "Next island", hint: "Next. What is the one destination for the next sprint?", tone: "idea" },
    ],
  },
  naruto: {
    name: "Naruto",
    group: "pop",
    blurb: "The teamwork we keep, what we avoided and it cost us, and the mission we accept next.",
    columns: [
      { id: "bond", title: "Bond", hint: "Keep. What teamwork held this sprint together?", tone: "good" },
      { id: "shadow", title: "Avoided", hint: "Stop. What did we avoid this sprint, and what did that cost?", tone: "bad" },
      { id: "scroll", title: "Next mission", hint: "Next. What mission are we accepting for the next sprint?", tone: "idea" },
    ],
  },
  bleach: {
    name: "Bleach",
    group: "pop",
    blurb: "The strength we keep drawing, what emptied this sprint, and the power we have not used yet.",
    columns: [
      { id: "blade", title: "Our blade", hint: "Keep. What strength should we keep using next sprint?", tone: "good" },
      { id: "hollow", title: "Hollow", hint: "Stop. What emptied this sprint of energy?", tone: "bad" },
      { id: "bankai", title: "Unused power", hint: "Next. What strength do we already have, and did not use this sprint?", tone: "idea" },
    ],
  },
  lotr: {
    name: "Lord of the Rings",
    group: "pop",
    blurb: "Who carried this sprint, the burden we put down, and the next stretch of road.",
    columns: [
      { id: "fellowship", title: "Fellowship", hint: "Keep. Who or what carried this sprint?", tone: "good" },
      { id: "ring", title: "The ring", hint: "Stop. What burden should we put down before the next sprint?", tone: "bad" },
      { id: "road", title: "The road", hint: "Next. What is the next stretch of the sprint?", tone: "idea" },
    ],
  },
  "stranger-things": {
    name: "Stranger Things",
    group: "pop",
    blurb: "What the group did well, what flipped on us, and the one gate we close before the next sprint.",
    columns: [
      { id: "party", title: "The party", hint: "Keep. What did the group do this sprint that worked?", tone: "good" },
      { id: "upside", title: "Upside Down", hint: "Stop. What flipped this sprint and hurt us?", tone: "bad" },
      { id: "gate", title: "The gate", hint: "Next. What opening from this sprint will we close before the next one?", tone: "idea" },
    ],
  },
  avatar: {
    name: "Avatar",
    group: "pop",
    blurb: "What stayed healthy, what burned this sprint, and the skill we practice next.",
    columns: [
      { id: "balance", title: "Balance", hint: "Keep. What stayed healthy this sprint and should stay?", tone: "good" },
      { id: "fire", title: "Fire", hint: "Stop. What burned time, trust, or quality this sprint?", tone: "bad" },
      { id: "element", title: "Next element", hint: "Next. What skill will we practice next sprint?", tone: "idea" },
    ],
  },
  sherlock: {
    name: "Sherlock",
    group: "pop",
    blurb: "The conclusion we keep, the blind spot we stop ignoring, and the question the next sprint answers.",
    columns: [
      { id: "deduction", title: "Deduction", hint: "Keep. What conclusion does this sprint actually support?", tone: "good" },
      { id: "blind", title: "Blind spot", hint: "Stop. What did we keep missing this sprint?", tone: "bad" },
      { id: "case", title: "Next case", hint: "Next. Which blind spot becomes the question we answer next sprint?", tone: "idea" },
    ],
  },
  "squid-game": {
    name: "Squid Game",
    group: "pop",
    blurb: "Green light is what kept us moving. Red light is what froze us. The next game is what we play differently.",
    columns: [
      { id: "circle", title: "Green light", hint: "Keep. What kept this sprint moving, and should move again?", tone: "good" },
      { id: "triangle", title: "Red light", hint: "Stop. What froze this sprint or knocked people out?", tone: "bad" },
      { id: "square", title: "Next game", hint: "Next. What will we play differently next sprint?", tone: "idea" },
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
  "avatar:balance": "☯️",
  "avatar:fire": "🔥",
  "avatar:element": "💧",
  "sherlock:deduction": "🔍",
  "sherlock:blind": "🙈",
  "sherlock:case": "🎩",
  "squid-game:circle": "🟢",
  "squid-game:triangle": "🔴",
  "squid-game:square": "⏭️",
};

export function columnMark(templateId: string, columnId: string): string {
  return COLUMN_MARKS[`${templateId}:${columnId}`] ?? "•";
}

export function columnsFor(templateId: RetroTemplateId): RetroColumn[] {
  return RETRO_TEMPLATES[templateId].columns.map((column) => ({ ...column }));
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
  items: ReviewSeedItem[];
}

const REVIEW_SECTIONS: ReviewSeedSection[] = [
  {
    id: "increment",
    title: "Increment",
    intent: "Show what is actually done.",
    items: [
      {
        id: "goal-visible",
        label: "Sprint goal is visible to everyone in the room",
        detail: "Say the goal before the demo, in one sentence.",
        required: true,
      },
      {
        id: "dod",
        label: "The increment meets the Definition of Done",
        detail: "If something is not done, say so before the demo, not after a question.",
        required: true,
      },
      {
        id: "undone",
        label: "Unfinished work is called out explicitly",
        detail: "Name the stories that slipped and where they go next.",
        required: true,
      },
      {
        id: "environment",
        label: "The demo environment is ready",
        detail: "Open the path a stakeholder will see. Skip local-only surprises.",
      },
    ],
  },
  {
    id: "story",
    title: "Story of the sprint",
    intent: "Demo the user journey, not the ticket list.",
    items: [
      {
        id: "stakeholders",
        label: "The people who can judge the outcome are here",
        detail: "Support, sales, design, or a customer proxy — whoever feels the change.",
        required: true,
      },
      {
        id: "journey",
        label: "The demo follows a user journey",
        detail: "Start from the trigger. End at the outcome the sprint promised.",
        required: true,
      },
      {
        id: "acceptance",
        label: "Acceptance criteria are visible with each story",
        detail: "Show the check that made it acceptable, not only the UI.",
      },
      {
        id: "outcome-stated",
        label: "The business outcome of the sprint is stated",
        detail: "What should be different for users or the business because this shipped?",
        required: true,
      },
    ],
  },
  {
    id: "evidence",
    title: "Evidence",
    intent: "Put numbers next to the narrative.",
    items: [
      {
        id: "metrics",
        label: "The metrics that matter for this goal are on screen",
        detail: "Adoption, defects, cycle time, revenue — only the ones this sprint could move.",
      },
      {
        id: "bugs",
        label: "Known bugs and incidents are disclosed",
        detail: "Severity and whether a user can hit them.",
        required: true,
      },
      {
        id: "quality-bar",
        label: "Quality checks that apply were run",
        detail: "Accessibility, analytics, privacy, or performance — whichever this increment touches.",
      },
      {
        id: "notes",
        label: "Release notes or a changelog draft exists",
        detail: "Even an internal note. Future-you will need the reason.",
      },
    ],
  },
  {
    id: "close",
    title: "Close the loop",
    intent: "Leave with feedback, a decision, and a backlog that matches both.",
    items: [
      {
        id: "feedback-live",
        label: "Feedback is captured in the room",
        detail: "Use the feedback column. Do not trust memory after the call.",
        required: true,
      },
      {
        id: "scope",
        label: "Scope changes discovered in the review are recorded",
        detail: "New requests are notes, not silent commitments.",
      },
      {
        id: "decision-made",
        label: "The release decision is explicit",
        detail: "Ship, iterate, or hold. Pick one before people leave.",
        required: true,
      },
      {
        id: "backlog",
        label: "The product backlog is adjusted before the room closes",
        detail: "The next sprint should not start from a stale list.",
        required: true,
      },
    ],
  },
];

export function createReviewState(): ReviewState {
  return {
    goal: "",
    decision: null,
    decisionNotes: "",
    feedback: [],
    sections: REVIEW_SECTIONS.map((section) => ({
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
    })),
  };
}
