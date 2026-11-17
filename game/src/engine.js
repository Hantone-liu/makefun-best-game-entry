// Prism Panes — the rules, with no drawing and no DOM: beam tracing, rotation,
// win detection and scoring. Pure enough to run under Node for testing.

import { BOARD, DIRS, REFLECT, SCORING, otherOrientation } from './config.js';

function key(x, y) {
  return `${x},${y}`;
}

export function cellCenter(x, y) {
  return { x: BOARD.x + (x + 0.5) * BOARD.cell, y: BOARD.y + (y + 0.5) * BOARD.cell };
}

function inside(x, y) {
  return x >= 0 && x < BOARD.cols && y >= 0 && y < BOARD.rows;
}

/** A fresh, playable copy of level `def`. */
export function createLevel(def) {
  const mirrors = new Map();
  for (const m of def.mirrors) {
    mirrors.set(key(m.x, m.y), { x: m.x, y: m.y, orient: m.orient, solution: m.solution, fixed: m.fixed });
  }
  const walls = new Set(def.walls.map((w) => key(w.x, w.y)));
  const targets = def.targets.map((t) => ({ ...t, lit: false, wrong: false }));
  return {
    def,
    mirrors,
    walls,
    targets,
    moves: 0,
    timeLeft: def.time,
    status: 'playing', // playing | complete | failed
    levelScore: 0,
    stars: 0,
    segments: [],
    litCount: 0,
  };
}

/**
 * Trace every emitter's beam across the board. Returns the drawn segments
 * (pixel endpoints, in cell-centre space), which targets are lit, and whether
 * any target was hit by the wrong colour. A beam stops at a wall, a target, or
 * the board edge; a visited (cell, direction) pair breaks a mirror loop.
 */
export function traceBeams(level) {
  const segments = [];
  for (const target of level.targets) {
    target.lit = false;
    target.wrong = false;
  }
  let wrongHit = false;
  for (const emitter of level.def.emitters) {
    let x = emitter.x;
    let y = emitter.y;
    let dir = emitter.dir;
    const visited = new Set();
    let from = cellCenter(x, y);
    for (let step = 0; step < 64; step += 1) {
      const stepDir = DIRS[dir];
      const nx = x + stepDir.x;
      const ny = y + stepDir.y;
      if (!inside(nx, ny)) {
        // The beam leaves the board from the cell it is in now, not from the
        // last mirror it bent at: start the exit stub at the current cell.
        const cur = cellCenter(x, y);
        segments.push({ x1: cur.x, y1: cur.y, x2: cur.x + stepDir.x * BOARD.cell * 0.5, y2: cur.y + stepDir.y * BOARD.cell * 0.5, color: emitter.color });
        break;
      }
      const at = cellCenter(nx, ny);
      const seen = `${nx},${ny},${dir}`;
      if (visited.has(seen)) {
        segments.push({ x1: from.x, y1: from.y, x2: at.x, y2: at.y, color: emitter.color });
        break;
      }
      visited.add(seen);
      if (level.walls.has(key(nx, ny))) {
        segments.push({ x1: from.x, y1: from.y, x2: at.x, y2: at.y, color: emitter.color });
        break;
      }
      const mirror = level.mirrors.get(key(nx, ny));
      if (mirror) {
        segments.push({ x1: from.x, y1: from.y, x2: at.x, y2: at.y, color: emitter.color });
        dir = REFLECT[mirror.orient][dir];
        x = nx;
        y = ny;
        from = at;
        continue;
      }
      const target = level.targets.find((t) => t.x === nx && t.y === ny);
      if (target) {
        segments.push({ x1: from.x, y1: from.y, x2: at.x, y2: at.y, color: emitter.color });
        if (target.color === emitter.color) target.lit = true;
        else {
          target.wrong = true;
          wrongHit = true;
        }
        break;
      }
      x = nx;
      y = ny;
    }
  }
  level.segments = segments;
  level.litCount = level.targets.filter((t) => t.lit).length;
  return { segments, litCount: level.litCount, wrongHit };
}

/** Rotate the mirror at (x, y) if it is rotatable. Returns true when it turned. */
export function rotateMirror(level, x, y) {
  if (level.status !== 'playing') return false;
  const mirror = level.mirrors.get(key(x, y));
  if (!mirror || mirror.fixed) return false;
  mirror.orient = otherOrientation(mirror.orient);
  level.moves += 1;
  traceBeams(level);
  return true;
}

/** How many targets the level has, and how many are lit. */
export function progress(level) {
  return { lit: level.litCount, total: level.targets.length };
}

export function isSolved(level) {
  return level.litCount === level.targets.length;
}

/** Stars for a finished level: 3 at par or under, 2 within par + 2, else 1. */
export function starsFor(level) {
  if (level.moves <= level.def.par) return 3;
  if (level.moves <= level.def.par + 2) return 2;
  return 1;
}

/** Score for a finished level: base + time left + a bonus for beating par. */
export function scoreFor(level) {
  const par = level.def.par;
  let score = SCORING.levelBase + Math.ceil(level.timeLeft) * SCORING.timeBonusPerSecond;
  if (level.moves < par) score += (par - level.moves) * SCORING.underParBonus;
  if (level.moves <= par) score += SCORING.atParBonus;
  return score;
}

/** Advance the clock; a level whose timer hits zero fails. */
export function tick(level, dt) {
  if (level.status !== 'playing') return;
  level.timeLeft -= dt;
  if (level.timeLeft <= 0) {
    level.timeLeft = 0;
    level.status = 'failed';
  }
}

/** Mark a solved level complete and stamp its score and stars. */
export function completeLevel(level) {
  level.status = 'complete';
  level.stars = starsFor(level);
  level.levelScore = scoreFor(level);
  return { stars: level.stars, score: level.levelScore };
}

/**
 * The rotations that solve the level, as [x, y] pairs in definition order —
 * used by the deterministic screenshot scenes, never shown to the player.
 */
export function solutionRotations(def) {
  return def.mirrors
    .filter((m) => !m.fixed && m.orient !== m.solution)
    .map((m) => [m.x, m.y]);
}
