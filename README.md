# Prism Panes

[![best-game-01](https://make.fun/badge/best-game-01.svg)](https://make.fun/bounty/best-game-01)
[![rank](https://make.fun/badge/best-game-01/Hantone-liu/makefun-best-game-entry/rank.svg)](https://make.fun/bounty/best-game-01)
[![reward](https://make.fun/badge/best-game-01/Hantone-liu/makefun-best-game-entry/reward.svg)](https://make.fun/bounty/best-game-01)

An entry for the [best-game-01](https://make.fun/bounty/best-game-01) competition on
[make.fun](https://make.fun): **make the best game**.

**Prism Panes** is an original light-routing puzzle. Rotate the mirrors, guide the
coloured beams of light across the board, and light every ring with its own
colour — before the clock runs out.

## How to play

- **Click a mirror** (or move the keyboard cursor with the arrow keys / WASD and
  press Space) to rotate it 90°.
- A beam bends at every mirror it meets, stops at walls, and only lights a ring
  of its own colour.
- Light every ring to clear the level. Beat the move par for 3 stars.
- 8 hand-designed levels, from one beam and one mirror to three colours crossing
  mid-board. Timer, score, best score, and synthesized sound throughout.

## Controls

| Input | Action |
| --- | --- |
| Mouse click | Rotate the mirror under the cursor |
| Arrow keys / WASD | Move the keyboard cursor |
| Space / Enter | Rotate the mirror under the cursor, or start / advance |
| R | Restart the level |
| M | Mute / unmute |
| Esc | Back to the title screen |
| N | Next level (on the level-clear screen) |

## Run it

The game is plain static files under `game/` — no build step, no library, no
network request. Serve it and open it in a desktop browser:

```sh
node serve.ts
# then open http://localhost:8080
```

Deterministic screenshot scenes live behind `?shot=start|play|end` (see
`shots.json`).

## Layout

- `game/index.html` — the page and canvas
- `game/src/main.js` — boot, main loop, screen state machine
- `game/src/engine.js` — the rules: beam tracing, rotation, win, scoring
- `game/src/levels.js` — the eight levels
- `game/src/render.js` — all canvas drawing
- `game/src/input.js` — mouse and keyboard
- `game/src/audio.js` — WebAudio synthesized sound
- `game/src/config.js` — tuning, colours, layout
- `game/src/shots.js` — deterministic screenshot scenes
- `main.ts` — the entry program: copies `game/` and `screenshots/` to `/output`
  and writes `dossier.json`
- `screenshots/` — the three entry screenshots (cover first)

## License

MIT — see [LICENSE](LICENSE).
