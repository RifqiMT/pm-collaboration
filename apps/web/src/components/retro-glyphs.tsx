import { columnMark } from "@cadence/core";

const ART: Record<string, string> = {
  "start-stop-continue:start": "M16 26V10M16 14c-4 0-6-3-6-6 4 0 6 2 6 6zM16 14c4 0 6-3 6-6-4 0-6 2-6 6z",
  "start-stop-continue:stop": "M9 9h14v14H9z",
  "start-stop-continue:continue": "M8 16a8 8 0 1 0 2.4-5.7M8 6v5h5",
  "4ls:liked": "M16 26s-8-5-8-11a4.5 4.5 0 0 1 8-2 4.5 4.5 0 0 1 8 2c0 6-8 11-8 11z",
  "4ls:learned": "M12 24h8M13 21h6M16 6a6 6 0 0 0-3 11c1 .8 1.5 1.6 1.5 3h3c0-1.4.5-2.2 1.5-3A6 6 0 0 0 16 6z",
  "4ls:lacked": "M16 8a8 8 0 1 0 0 16 8 8 0 1 0 0-16M12 16h8",
  "4ls:longed": "M16 6l2.2 5.2L24 12l-4.2 3.4L21 21l-5-3-5 3 1.2-5.6L8 12l5.8-.8z",
  "mad-sad-glad:mad": "M8 22a10 8 0 0 1 16 0M12 12l2 2M20 12l-2 2M14 18h4",
  "mad-sad-glad:sad": "M11 12h.1M21 12h.1M12 20c1.4-2 6.6-2 8 0M16 6v4M14 7l2 3 2-3",
  "mad-sad-glad:glad": "M16 8v2M8 16h2M22 16h2M10 10l1.4 1.4M22 10l-1.4 1.4M11 19c1.6 2.2 8.4 2.2 10 0M16 12a4 4 0 1 0 0 8",
  "sailboat:wind": "M6 8c6 2 6 6 0 8M12 6c8 2 8 8 0 10M18 9c6 2 6 5 0 7",
  "sailboat:anchor": "M12.6 7a3.4 3.4 0 1 1 6.8 0 3.4 3.4 0 1 1-6.8 0M16 10.4V22M8 14h16M5 15h-1.5a12.5 12.5 0 0 0 25 0H27",
  "sailboat:rocks": "M6 24l5-8 3 4 4-9 4 7 4-4 2 10z",
  "sailboat:island": "M4 21c2.2 4 6.2 6 12 6s9.8-2 12-6c-2.4-5-6.4-8-12-8s-9.6 3-12 8zM16 13V6M11 9c2.2.4 4 2 5 4M21 9c-2.2.4-4 2-5 4",
  "rose-bud-thorn:rose": "M16 26v-8M16 18c-4 0-6-3-6-6 3 1 5 0 6-2 1 2 3 3 6 2 0 3-2 6-6 6z",
  "rose-bud-thorn:bud": "M16 26V16M16 16c-3-1-5-4-5-7 3 1 4 3 5 5 1-2 2-4 5-5 0 3-2 6-5 7z",
  "rose-bud-thorn:thorn": "M16 27V5M16 10l-6 3M16 16l6 3M16 22l-6 3",
  "went-well:well": "M7 17l6 6L25 9",
  "went-well:didnt": "M9 9l14 14M23 9L9 23",
  "went-well:puzzle": "M10 8h5a2.5 2.5 0 1 1 5 0h5v6a2.5 2.5 0 1 1 0 5v5H15a2.5 2.5 0 1 1-5 0H5v-6a2.5 2.5 0 1 0 0-5z",
  "daki:drop": "M16 6v14M11 15l5 6 5-6M8 26h16",
  "daki:add": "M16 7v18M7 16h18",
  "daki:keep": "M10 6h12v20l-6-4-6 4z",
  "daki:improve": "M8 22l4-8 4 3 8-11M20 6h6v6",
  "starfish:keep": "M16 5l2 6h6l-5 4 2 6-5-3-5 3 2-6-5-4h6z",
  "starfish:less": "M8 16h16",
  "starfish:more": "M16 8v16M8 16h16",
  "starfish:stop": "M11 7c0-2 2.2-3 5-3s5 1 5 3v8c2.2 0 3 1.6 3 3.2C24 23 21 26 16 26S8 23 8 18.2C8 16.6 9 15 11 15z",
  "starfish:start": "M10 26V8h2l10 6-10 6H12",
  "star-wars:force": "M16 16m-3 0a3 3 0 1 0 6 0a3 3 0 1 0-6 0M16 6v3M16 23v3M6 16h3M23 16h3M9 9l2 2M21 21l2 2M23 9l-2 2M11 21l-2 2",
  "star-wars:dark": "M16 26a10 10 0 1 1 0-20 8 8 0 0 0 0 16",
  "star-wars:hope": "M6 23h20M9 23a7 7 0 0 1 14 0M16 7v4M11 12l2.2 2.2M21 12l-2.2 2.2",
  "superhero:power": "M18 4L8 18h7l-1 10 10-14h-7z",
  "superhero:kryptonite": "M16 4l7 8-7 16-7-16zM9 12h14M16 12v16",
  "superhero:mission": "M16 7a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM16 12a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM16 15h.1",
  "arcade:powerup": "M16 24c-4 0-6-3-6-6 0-5 6-12 6-12s6 7 6 12c0 3-2 6-6 6z",
  "arcade:boss": "M8 14a8 8 0 0 1 16 0v6H8zM12 16h.1M20 16h.1M12 20h8M8 22l-2 4M24 22l2 4",
  "arcade:level": "M6 24h6v-5h6v-5h8",
  "premiere:blockbuster": "M8 10h16v12H8zM8 14h16M12 10v4M20 10v4",
  "premiere:flop": "M7 8h18v16H7zM7 8l18 16M11 8v16",
  "premiere:sequel": "M7 10h10v12H7zM15 13h10v12H15z",
  "quest:treasure": "M7 14h18v10H7zM7 14l3-5h12l3 5M16 14v10",
  "quest:dragon": "M5 20c2-2 4-8 9-8 3 0 4 2 7 2 4 0 6-4 7-4-1 4 0 6-2 7 3 1 4 4 3 6-4-1-6-3-9-3-3 0-6 2-9 2-5 0-7-2-6-2zM11 16h.1M24 12l3-2",
  "quest:chapter": "M6 8h8c2 0 3 1 3 3v13H9c-2 0-3 1-3 3zM26 8h-8c-2 0-3 1-3 3v13h8c2 0 3 1 3 3z",
  "race:podium": "M12 16h8v10h-8zM6 20h6v6H6zM20 18h6v8h-6z",
  "race:safety": "M6 20h16l2-5H10zM9 20v3M21 20v3M8 16l2-4h8",
  "race:dnf": "M8 26V6M8 8h12l-3 4 3 4H8M19 20l6 6M25 20l-6 6",
  "race:pole": "M16 26V6M16 8h10l-2 3 2 3h-10",
  "pokemon:caught": "M16 6a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM6 16h20M16 13a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  "pokemon:fainted": "M10 18c2-4 10-4 12 0M8 10l3 2M24 10l-3 2M16 8l-1 3",
  "pokemon:evolve": "M16 26V10M11 15l5-8 5 8M8 22h4M20 22h4",
  "heist:crew": "M8 22a4 4 0 0 1 8 0M16 22a4 4 0 0 1 8 0M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM20 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  "heist:alarm": "M16 8a6 6 0 0 1 6 6v6H10v-6a6 6 0 0 1 6-6zM8 20h16M14 24h4M16 4v2",
  "heist:getaway": "M6 20h18l2-6H12L8 20zM8 20a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM22 20a2 2 0 1 0 0 4 2 2 0 0 0 0-4z",
  "noir:clue": "M14 14a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM17 17l7 7",
  "noir:herring": "M6 16c4-5 10-6 16-4 2 4-2 8-6 8-4 0-8-1-10-4zM24 12l3 4-3 4M12 16h.1",
  "noir:reveal": "M4 16s5-7 12-7 12 7 12 7-5 7-12 7S4 16 4 16zM16 13a3 3 0 1 0 0 6 3 3 0 0 0 0-6z",
  "concert:encore": "M12 24V10l12-3v14M12 14l12-3M9 24a3 3 0 1 0 0-6M21 21a3 3 0 1 0 0-6",
  "concert:sour": "M14 24V12l10-2v8M14 16l10-2M11 24a3 3 0 1 0 0-6M22 8l4 4M26 8l-4 4",
  "concert:setlist": "M10 6h12v20H10zM13 11h6M13 16h6M13 21h4",
  "wizarding:spell": "M7 25L19 11M17 9l2 2 3-5-5 3zM23 6v2M25 11h2",
  "wizarding:curse": "M16 6a6 6 0 0 0-6 7c0 3 2 5 3.2 7h5.6C20 18 22 16 22 13a6 6 0 0 0-6-7zM13 13h.1M19 13h.1M14 19h4",
  "wizarding:prophecy": "M16 20a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM12 24h8M14 24v2M18 24v2",
  "streaming:binge": "M10 8l14 8-14 8z",
  "streaming:skip": "M8 9l8 7-8 7zM18 9l8 7-8 7z",
  "streaming:soon": "M8 8h16v16H8zM8 13h16M13 6v4M19 6v4",
  "marvel:assemble": "M16 5l9 3.5v7c0 6.5-9 11.5-9 11.5S7 22 7 15.5v-7z",
  "marvel:snap": "M16 4l2.2 6.2L24 12l-5.8 1.8L16 20l-2.2-6.2L8 12l5.8-1.8zM6 22h4M22 22h4",
  "marvel:endgame": "M16 16a7 7 0 1 0 0.1 0M16 9v14M11 16h10",
  "dc:signal": "M16 26V10M11 12c1.6-3 8.4-3 10 0M7 26h18M16 6v2",
  "dc:gotham": "M5 26V16h4v10M11 26V9h6v17M19 26V14h6v12",
  "dc:league": "M16 6v14M8 24h16M11 10l-4 7h8zM21 10l4 7h-8z",
  "harry-potter:patronus": "M16 24c-5 0-8-4-8-8 0-5 5-9 8-12 3 3 8 7 8 12 0 4-3 8-8 8z",
  "harry-potter:dementor": "M10 8c0 8 2 14 6 16 4-2 6-8 6-16-2 3-4 4-6 4s-4-1-6-4zM13 14h.1M19 14h.1",
  "harry-potter:horcrux": "M16 6a6 6 0 0 0-6 8c0 5 6 12 6 12s6-7 6-12a6 6 0 0 0-6-8zM14 12l4 4M18 12l-4 4",
  "breaking-bad:sky": "M14 5h4M14.5 5v6L10 20a5 5 0 0 0 12 0l-4.5-9V5M11 16h10",
  "breaking-bad:contaminate": "M11 7h10l-1.5 7H12.5zM8 24h16M16 14v6M13 24l2-4 2 4",
  "breaking-bad:exit": "M9 6h12v20H9zM15 16h6M19 13l3 3-3 3",
  "criminal-minds:profile": "M16 7a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM9 25c1.2-4.2 3.4-6.5 7-6.5s5.8 2.3 7 6.5",
  "criminal-minds:unsub": "M11 9c1.5-3 8.5-3 10 0 2 6 2 10 0 15H11c-2-5-2-9 0-15zM16 15h.1",
  "criminal-minds:casefile": "M8 10h6l2 2h8v12H8z",
  "ncis:evidence": "M16 7a6 6 0 1 0 0 12 6 6 0 0 0 0-12zM16 10.5v3.2M16 16.5h.1",
  "ncis:cold": "M16 6v20M8 10l8 6 8-6M8 22l8-6 8 6",
  "ncis:rule": "M9 8h15M9 16h15M9 24h10M7 8h.1M7 16h.1M7 24h.1",
  "one-piece:treasure": "M7 14h18v10H7zM7 14l3-5h12l3 5M16 14v10",
  "one-piece:storm": "M5 20c3-5 6-5 9 0s6 5 9 0M16 5v7M14 7l2-3 2 3",
  "one-piece:island": "M4 22c3 3 7 5 12 5s9-2 12-5c-3-6-7-9-12-9s-9 3-12 9zM16 13V7M12 10c2 1 3 2 4 4M20 10c-2 1-3 2-4 4",
  "naruto:bond": "M8 22a4 4 0 0 1 8 0M16 22a4 4 0 0 1 8 0M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM20 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
  "naruto:shadow": "M13 8a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM9 24c1-5 3-7 6-7M17 14l7 8",
  "naruto:scroll": "M8 9h16v14H8zM8 9c0 2 2 2 2 4M24 9c0 2-2 2-2 4",
  "bleach:blade": "M16 4v16M12 20h8M16 20v6M14 8h4",
  "bleach:hollow": "M8 14c0-6 16-6 16 0v4c0 5-4 8-8 8s-8-3-8-8zM12 15h.1M20 15h.1M14 19h4",
  "bleach:bankai": "M16 26c-5 0-8-4-6-9 1.5-3 2.5-5 2-8 3 2 4 5 3.5 8 2-2 3-5 2-8 4 4 6 8 4 13 0 3-2 4-5.5 4z",
  "lotr:fellowship": "M6 20a3.5 3.5 0 1 1 4 0M14 18a3.5 3.5 0 1 1 4 0M22 20a3.5 3.5 0 1 1 4 0",
  "lotr:ring": "M16 16a6 6 0 1 0 .1 0M16 16a2 2 0 1 0 .1 0",
  "lotr:road": "M10 26c3-6 3-10 0-16M22 26c-3-6-3-10 0-16M16 26V8",
  "stranger-things:party": "M8 18h14l2-5H12zM9 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM20 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM8 13l2-4h6",
  "stranger-things:upside": "M6 8h20L16 26zM16 12v7",
  "stranger-things:gate": "M8 26V12a8 8 0 0 1 16 0v14M8 26h16M16 14v6",
  "avatar:balance": "M16 6a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM16 6c2.8 2.6 2.8 7.4 0 10-2.8 2.6-2.8 7.4 0 10",
  "avatar:fire": "M16 26c-5 0-7-4-5-8 2-3 2-6 1-9 3 2 5 5 4 8 2-2 2-5 1-8 4 3 6 7 5 12 0 3-2 5-6 5z",
  "avatar:element": "M16 5v6M16 21v6M5 16h6M21 16h6M8 8l4 4M20 20l4 4M24 8l-4 4M12 20l-4 4",
  "sherlock:deduction": "M14 14a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM17.5 17.5L24 24",
  "sherlock:blind": "M4 16s5-6 12-6 12 6 12 6-5 6-12 6S4 16 4 16zM7 9l18 14",
  "sherlock:case": "M8 18c2-7 14-7 16 0M6 18h20v3H6zM12 21v3M20 21v3",
  "squid-game:circle": "M16 6a5 5 0 1 0 0 10 5 5 0 0 0 0-10zM16 16v8M12 24h8",
  "squid-game:triangle": "M16 7a6 6 0 1 0 0 12 6 6 0 0 0 0-12zM12 10l8 8M20 10l-8 8",
  "squid-game:square": "M9 6h12v20H9zM15 15h7M18 12l4 3-4 3",
};

export function hasRetroGlyph(templateId: string, columnId: string): boolean {
  return Boolean(ART[`${templateId}:${columnId}`]);
}

export function RetroGlyph({ templateId, columnId }: { templateId: string; columnId: string }) {
  const key = `${templateId}:${columnId}`;
  const d = ART[key];
  if (!d) {
    return (
      <span className="retro-glyph emoji" aria-hidden="true">
        {columnMark(templateId, columnId)}
      </span>
    );
  }
  return (
    <svg
      className="retro-glyph"
      viewBox="0 0 32 32"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={d} />
    </svg>
  );
}
