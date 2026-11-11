# TeamCompass — Design Guidelines

**Brand:** TeamCompass  
**Surfaces:** Web (`globals.css`) · Mobile (`apps/mobile/src/ui.js`)  
**Last updated:** 2026-11-11  

---

## 1. Design principles

1. **One board, one ritual** — Each section of a retrospective shows only that section’s work.  
2. **Brand first** — The TeamCompass wordmark is a primary identity signal in the top bar; ritual pages stay calm and content-led.  
3. **Facilitation clarity** — Phase washes, host controls, and timers make “where we are” obvious.  
4. **Honest color** — Semantic tones (good / bad / idea / neutral) map to column meaning, not decoration.  
5. **Light workplace default** — Single light theme; no dark mode in the current product.  
6. **Motion with purpose** — Short ease for hover/lift; avoid noise.  

---

## 2. Typography

| Token / use | Spec |
| --- | --- |
| Family | **Instrument Sans** via `next/font` → `--font-sans` |
| Fallbacks | `"Avenir Next", "Segoe UI", sans-serif` |
| Headings / wordmark / room title | Weight ~640–700; tracking `-0.04em` |
| Body | Default inherit; line-height ~1.5 |
| Eyebrow | Uppercase; letter-spacing `0.12em`; ~0.68rem; soft ink |
| Mobile title | ~36px / weight 600 / tracking -0.8 |

Do not introduce Inter, Roboto, or system-ui as the primary brand face on new marketing surfaces without a brand decision.

---

## 3. Color palettes

### 3.1 Core semantic tokens (web `:root`)

| Token | Hex | Friendly role |
| --- | --- | --- |
| `--ink` | `#12141a` | Primary text, primary button fill |
| `--ink-soft` | `#5c6573` | Secondary text, labels |
| `--paper` | `#f4f5f7` | Page atmosphere / `themeColor` |
| `--paper-deep` | `#e7e9ee` | Deeper wash |
| `--card` | `#ffffff` | Surfaces |
| `--line` | `#e3e6ec` | Hairline borders |
| `--line-strong` | `#d3d7e0` | Stronger borders on controls |
| `--accent` | `#e23b16` | Brand accent (also `--terra`) |
| `--accent-deep` | `#b4230e` | Accent press / links |
| `--sage` | `#0d7a45` | Positive / “good” |
| `--sea` | `#1d4ed8` | Idea / focus ring |
| `--gold` | `#9a6700` | Neutral / caution |
| `--bad` | `#c4233a` | Negative / error |
| `--pair-a` | `#0f6e6a` | This-or-That side A |
| `--pair-a-soft` | `#dff3f1` | Side A soft fill |
| `--pair-a-mid` | `#1a8a84` | Side A mid |
| `--pair-b` | `#d9481f` | This-or-That side B |
| `--pair-b-soft` | `#fde8e1` | Side B soft fill |
| `--pair-b-mid` | `#e25a33` | Side B mid |

### 3.2 Elevation & motion tokens

| Token | Value | Use |
| --- | --- | --- |
| `--shadow` | `0 1px 2px rgba(18, 20, 26, 0.04)` | Resting |
| `--shadow-lift` | `0 8px 24px rgba(18, 20, 26, 0.08)` | Hover lift |
| `--ease` | `cubic-bezier(0.2, 0.8, 0.2, 1)` | Transitions |
| `--gutter` | `8px` | Page horizontal rhythm |

### 3.3 Participant palette

Assigned at join (not CSS variables):  
`#c2512c`, `#1f5f73`, `#2f6b52`, `#8a5a12`, `#6b3f69`, `#3d4c2f`, `#8d3d4a`, `#3f5f8a`

### 3.4 Mobile colors (`colors` in `ui.js`)

| Key | Hex | Maps to |
| --- | --- | --- |
| `ink` | `#12141a` | `--ink` |
| `soft` | `#5c6573` | `--ink-soft` |
| `paper` | `#f4f5f7` | `--paper` |
| `paperDeep` | `#e7e9ee` | `--paper-deep` |
| `card` | `#ffffff` | `--card` |
| `line` | `#e3e6ec` | `--line` |
| `terra` / `terraDeep` | `#e23b16` / `#b4230e` | accent |
| `sage` | `#0d7a45` | positive |
| `bad` | `#c4233a` | negative |

Mobile also uses ritual accent washes (e.g. `accentRetro: #fff8f5`) for card tinting.

### 3.5 Theme

| Theme | Status |
| --- | --- |
| Light | **Only shipped theme** |
| Dark | Not implemented — do not invent an unofficial dark palette in docs as shipped |

---

## 4. Column & phase semantics

### Column tones

| Tone | Meaning | Color mapping |
| --- | --- | --- |
| `good` | Keep / positive | Sage |
| `bad` | Stop / pain | Bad red |
| `idea` | Try / idea | Sea blue |
| `neutral` | Mixed / puzzle | Gold |

CSS classes: `.tone-good`, `.tone-bad`, `.tone-idea`, `.tone-neutral`.

### Retro phase washes

Phase chrome uses distinct washes so facilitators and contributors feel the section change (icebreak → brainstorm → discuss → vote → act → summary). Summary is collection-focused (no timer chrome).

---

## 5. Components

### 5.1 Wordmark

- Text **TeamCompass**  
- Leading mark: 1.15rem square, 6px radius, diagonal ink→accent gradient  
- Sticky top bar with translucent white + blur on web  

### 5.2 Buttons

| Variant | Appearance |
| --- | --- |
| `.btn` | Card border, 10px radius, weight 650 |
| `.btn.primary` | Ink fill, white text |
| `.btn.ghost` | Transparent |
| `.btn.tiny` | Compact 8px radius |
| Disabled | 0.45 opacity |

Hover (pointer devices): stronger border + `--shadow-lift`; ritual cards lift `-2px`.

### 5.3 Ritual cards (home)

- Bordered card, not a dashboard grid of metrics  
- Index `01…`, title, promise, detail, step list  
- Kind-specific class `kind-retro|review|roadmap`  

### 5.4 Forms & fields

- Shared optimistic fields (`SharedField`) commit on blur/Enter  
- Inputs inherit font; focus-visible outline `2px solid var(--sea)`  

### 5.5 Boards

| Board | Design notes |
| --- | --- |
| Retro | Columns with glyphs that scale with note volume; phase tools; timers |
| Review | Checklist + side panel for goal, feedback, decision |
| Roadmap | Initiative cards + score/complexity chart + insights |

### 5.6 Icebreaker This or That

Use `--pair-a*` / `--pair-b*` so sides stay distinguishable without relying on text alone.

### 5.7 Roadmap chart

- Plot score vs complexity  
- Vertical dashed guide at complexity **3.5**  
- Horizontal dashed guide at **median score**  
- Provide list/bar view as accessible equivalent  

---

## 6. Layout & spacing

- Page padding uses `--gutter` (8px) with generous bottom padding  
- Sticky topbar / room-bar for orientation  
- Prefer full-width content lanes over multi-widget dashboards for ritual focus  
- Mobile body padding ~8px horizontal; large title hierarchy  

---

## 7. Motion

Ship intentional, quiet motion:

1. Button/card border + shadow transitions (~160ms `--ease`)  
2. Ritual card hover translateY(-2px)  
3. Phase/timer UI state changes (tone shifts, countdown)  

Avoid decorative perpetual animations, glow stacks, and emoji as structure.

---

## 8. Accessibility

- Skip link to `#main`  
- `:focus-visible` sea outline  
- `.sr` screen-reader utility  
- Roadmap list as accessible companion to the chart  
- Do not convey critical state by color alone (labels on tones, decisions, insights)  

---

## 9. Content tone

- Direct, calm, facilitator-friendly  
- Prefer “ship / iterate / hold” over jargon  
- Error copy is human (`CadenceError` messages) — keep that voice in UI  

---

## 10. Do / Don’t

| Do | Don’t |
| --- | --- |
| Use existing CSS variables | Introduce purple-gradient “AI default” themes |
| Keep light paper + ink + terra accent | Ship an unofficial dark mode |
| Put brand wordmark in chrome | Overpower the brand with a competing hero headline on home |
| Map tones to column meaning | Use color as pure decoration on boards |
| Share tokens with mobile `colors` | Drift hex values between platforms |

---

## 11. File references

- Web tokens & components: `apps/web/src/app/globals.css`  
- Font & metadata: `apps/web/src/app/layout.tsx`  
- Mobile tokens: `apps/mobile/src/ui.js`  
- Glyphs: `apps/web/src/components/retro-glyphs.tsx`
