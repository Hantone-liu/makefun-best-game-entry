// Prism Panes — every tuning number, colour and layout constant in one place.
// The playfield is a fixed 1280x720 logical area; the renderer scales it to the
// window, so no rule below depends on the screen size.

export const FIELD = { width: 1280, height: 720 };

/** The board is 8x8 cells of 64px, placed left of the side panel. */
export const BOARD = { cols: 8, rows: 8, cell: 64, x: 72, y: 104 };

/** The side panel holding the HUD, level info and buttons. */
export const PANEL = { x: 624, y: 104, width: 584, height: 512 };

export const STEP = 1 / 60;

export const COLORS = {
  red: '#ff5d5d',
  blue: '#4da6ff',
  green: '#58d68d',
};

export const COLOR_NAMES = { red: 'Red', blue: 'Blue', green: 'Green' };

/** Beam directions, as unit steps. */
export const DIRS = {
  N: { x: 0, y: -1 },
  E: { x: 1, y: 0 },
  S: { x: 0, y: 1 },
  W: { x: -1, y: 0 },
};

/**
 * Mirror reflection table. A '/' mirror turns N->E, E->N, S->W, W->S;
 * a '\' mirror turns N->W, W->N, S->E, E->S.
 */
export const REFLECT = {
  '/': { N: 'E', E: 'N', S: 'W', W: 'S' },
  '\\': { N: 'W', W: 'N', S: 'E', E: 'S' },
};

/** A mirror toggles between the two orientations when clicked. */
export function otherOrientation(orient) {
  return orient === '/' ? '\\' : '/';
}

export const SCORING = {
  levelBase: 500,
  timeBonusPerSecond: 5,
  underParBonus: 50,
  atParBonus: 100,
};

export const PALETTE = {
  backdrop: '#0d1220',
  board: '#141b2e',
  boardLine: '#232c47',
  panel: '#171e33',
  panelEdge: '#2a3454',
  text: '#eef1f5',
  muted: '#8b93a3',
  accent: '#ffd166',
  mirror: '#c8d2e0',
  mirrorFixed: '#7d8aa5',
  wall: '#3a4358',
  danger: '#ff5d5d',
  ok: '#58d68d',
};

export const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';

/** Where the best total score is kept between visits (this browser only). */
export const BEST_KEY = 'prism-panes.best';
