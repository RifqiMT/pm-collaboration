# Cadence

Cadence is a shared room for three sprint rituals: the retrospective, the sprint review, and roadmap scoring. A team joins with a short code and edits the same board. The web app is the full room. The phone app joins the same rooms.

## Run the web app

```bash
npm install
npm test
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Create a room, copy the code, and open it in another browser to collaborate.

## Run the phone app

The API has to be the machine running the web app, not the phone itself.

```bash
npm run dev
cd apps/mobile
npx expo start
```

On the phone’s home screen, set the server to your computer’s address, for example `http://192.168.1.20:3000`. A simulator on the same machine can use `http://localhost:3000`. Android emulators often need `http://10.0.2.2:3000`.

## What’s in a room

- **Retrospective.** Icebreaker, private notes, discussion, dot voting, then actions with owners. Each section shows only that section’s work. Shapes include the classic formats plus pop-culture sets: Star Wars, superhero, arcade, premiere, quest, race weekend, Pokémon, heist, noir, concert, wizarding, streaming, Marvel, DC, Harry Potter, Breaking Bad, Criminal Minds, NCIS, One Piece, Naruto, Bleach, Lord of the Rings, Stranger Things, Avatar, Sherlock, and Squid Game. Each column is a decision about this sprint and the next one, with a graphic in its header that grows as notes collect there.
- **Sprint review.** A shared checklist, evidence notes, live feedback, and one release decision: ship, iterate, or hold.
- **Roadmap.** Score initiatives with RICE, ICE, or value divided by complexity. The business outcome sits on the same card as the score. Complexity (technical, dependency, uncertainty) is a separate lens, so a high score with high complexity reads as a bet to sequence.

Scoring rules and variable definitions are in [docs/product.md](docs/product.md).

## Trust model

The room code is the only key. There are no accounts. Run Cadence on a trusted network. Rooms are stored in `apps/web/data/rooms.json` on that one server process. Two server processes would not share a room.

## Layout

- `packages/core` — room rules, privacy, and scores. Covered by unit tests.
- `apps/web` — Next.js app and the room API.
- `apps/mobile` — Expo app for iOS and Android, using the same API and the same scoring package.
