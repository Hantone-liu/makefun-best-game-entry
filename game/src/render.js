// Prism Panes — every pixel the player sees, drawn on one canvas. No images,
// no fonts to download: shapes, gradients and system text only.

import { BOARD, COLORS, COLOR_NAMES, FIELD, FONT, PALETTE, PANEL } from './config.js';
import { cellCenter } from './engine.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_COMPLETE = 'complete';
export const SCREEN_FAILED = 'failed';
export const SCREEN_RESULTS = 'results';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, size, color, align = 'left', weight = 600) {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px ${FONT}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(str, x, y);
}

function formatTime(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

function drawMirror(ctx, cx, cy, orient, fixed, hovered) {
  const half = BOARD.cell * 0.36;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.fillStyle = fixed ? PALETTE.mirrorFixed : PALETTE.mirror;
  ctx.strokeStyle = hovered ? PALETTE.accent : '#8b93a3';
  ctx.lineWidth = hovered ? 3 : 1.5;
  roundRect(ctx, -half, -half, half * 2, half * 2, 8);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = '#1b2133';
  ctx.lineWidth = 5;
  ctx.beginPath();
  if (orient === '/') {
    ctx.moveTo(half - 8, -half + 8);
    ctx.lineTo(-half + 8, half - 8);
  } else {
    ctx.moveTo(-half + 8, -half + 8);
    ctx.lineTo(half - 8, half - 8);
  }
  ctx.stroke();
  ctx.restore();
}

function drawEmitter(ctx, emitter, time) {
  const c = cellCenter(emitter.x, emitter.y);
  const color = COLORS[emitter.color];
  const pulse = 1 + Math.sin(time * 3 + emitter.x) * 0.08;
  const grad = ctx.createRadialGradient(c.x, c.y, 2, c.x, c.y, 26 * pulse);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.35, color);
  grad.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(c.x, c.y, 26 * pulse, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(c.x, c.y, 7, 0, Math.PI * 2);
  ctx.fill();
  // A small arrow showing which way the beam leaves.
  const dir = { N: [0, -1], E: [1, 0], S: [0, 1], W: [-1, 0] }[emitter.dir];
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(c.x + dir[0] * 14, c.y + dir[1] * 14);
  ctx.lineTo(c.x + dir[0] * 24, c.y + dir[1] * 24);
  ctx.stroke();
}

function drawTarget(ctx, target, time) {
  const c = cellCenter(target.x, target.y);
  const color = COLORS[target.color];
  const glow = target.lit ? 1 + Math.sin(time * 4) * 0.12 : 1;
  ctx.save();
  ctx.shadowColor = color;
  ctx.shadowBlur = target.lit ? 18 * glow : 4;
  ctx.strokeStyle = color;
  ctx.lineWidth = target.lit ? 5 : 3;
  ctx.beginPath();
  ctx.arc(c.x, c.y, 20, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(c.x, c.y, 11, 0, Math.PI * 2);
  ctx.stroke();
  if (target.lit) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(c.x, c.y, 7 * glow, 0, Math.PI * 2);
    ctx.fill();
  } else if (target.wrong) {
    ctx.strokeStyle = PALETTE.danger;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(c.x - 8, c.y - 8);
    ctx.lineTo(c.x + 8, c.y + 8);
    ctx.moveTo(c.x + 8, c.y - 8);
    ctx.lineTo(c.x - 8, c.y + 8);
    ctx.stroke();
  }
  ctx.restore();
}

function drawBeams(ctx, segments, time) {
  ctx.save();
  ctx.lineCap = 'round';
  for (const seg of segments) {
    const color = COLORS[seg.color];
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;
    ctx.strokeStyle = color;
    ctx.lineWidth = 7;
    ctx.globalAlpha = 0.85;
    ctx.beginPath();
    ctx.moveTo(seg.x1, seg.y1);
    ctx.lineTo(seg.x2, seg.y2);
    ctx.stroke();
    // A bright core with dashes that flow along the beam.
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.globalAlpha = 0.9;
    ctx.setLineDash([10, 14]);
    ctx.lineDashOffset = -time * 60;
    ctx.beginPath();
    ctx.moveTo(seg.x1, seg.y1);
    ctx.lineTo(seg.x2, seg.y2);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  ctx.restore();
}

function drawBoard(ctx, level, hover, cursor, time) {
  ctx.fillStyle = PALETTE.board;
  roundRect(ctx, BOARD.x - 8, BOARD.y - 8, BOARD.cols * BOARD.cell + 16, BOARD.rows * BOARD.cell + 16, 12);
  ctx.fill();
  ctx.strokeStyle = PALETTE.boardLine;
  ctx.lineWidth = 1;
  for (let i = 0; i <= BOARD.cols; i += 1) {
    ctx.beginPath();
    ctx.moveTo(BOARD.x + i * BOARD.cell, BOARD.y);
    ctx.lineTo(BOARD.x + i * BOARD.cell, BOARD.y + BOARD.rows * BOARD.cell);
    ctx.stroke();
  }
  for (let j = 0; j <= BOARD.rows; j += 1) {
    ctx.beginPath();
    ctx.moveTo(BOARD.x, BOARD.y + j * BOARD.cell);
    ctx.lineTo(BOARD.x + BOARD.cols * BOARD.cell, BOARD.y + j * BOARD.cell);
    ctx.stroke();
  }
  for (const w of level.walls) {
    const c = cellCenter(w.x, w.y);
    ctx.fillStyle = PALETTE.wall;
    roundRect(ctx, c.x - 26, c.y - 26, 52, 52, 6);
    ctx.fill();
    ctx.strokeStyle = '#565f78';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(c.x - 14, c.y);
    ctx.lineTo(c.x + 14, c.y);
    ctx.moveTo(c.x, c.y - 14);
    ctx.lineTo(c.x, c.y + 14);
    ctx.stroke();
  }
  drawBeams(ctx, level.segments, time);
  for (const emitter of level.def.emitters) drawEmitter(ctx, emitter, time);
  for (const target of level.targets) drawTarget(ctx, target, time);
  for (const mirror of level.mirrors.values()) {
    const c = cellCenter(mirror.x, mirror.y);
    const isHover =
      (hover !== null && hover.x === mirror.x && hover.y === mirror.y) ||
      (cursor !== null && cursor.x === mirror.x && cursor.y === mirror.y);
    drawMirror(ctx, c.x, c.y, mirror.orient, mirror.fixed, isHover);
  }
  if (hover !== null) {
    const hx = BOARD.x + hover.x * BOARD.cell;
    const hy = BOARD.y + hover.y * BOARD.cell;
    ctx.strokeStyle = 'rgba(255,209,102,0.7)';
    ctx.lineWidth = 2;
    ctx.strokeRect(hx + 2, hy + 2, BOARD.cell - 4, BOARD.cell - 4);
  }
  if (cursor !== null) {
    const cx = BOARD.x + cursor.x * BOARD.cell;
    const cy = BOARD.y + cursor.y * BOARD.cell;
    ctx.strokeStyle = PALETTE.accent;
    ctx.lineWidth = 3;
    ctx.setLineDash([6, 4]);
    ctx.strokeRect(cx + 3, cy + 3, BOARD.cell - 6, BOARD.cell - 6);
    ctx.setLineDash([]);
  }
}

function drawStars(ctx, cx, y, stars, size = 26) {
  for (let i = 0; i < 3; i += 1) {
    const x = cx + (i - 1) * (size + 14);
    ctx.fillStyle = i < stars ? PALETTE.accent : '#39415c';
    ctx.font = `${size}px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('★', x, y);
  }
}

function drawPanel(ctx, game) {
  const level = game.level;
  const def = level.def;
  ctx.fillStyle = PALETTE.panel;
  roundRect(ctx, PANEL.x, PANEL.y, PANEL.width, PANEL.height, 12);
  ctx.fill();
  ctx.strokeStyle = PALETTE.panelEdge;
  ctx.lineWidth = 1.5;
  roundRect(ctx, PANEL.x, PANEL.y, PANEL.width, PANEL.height, 12);
  ctx.stroke();

  let y = PANEL.y + 44;
  text(ctx, `LEVEL ${game.levelIndex + 1} / 8 — ${def.name}`, PANEL.x + 28, y, 24, PALETTE.text);
  y += 30;
  text(ctx, def.hint, PANEL.x + 28, y, 15, PALETTE.muted);
  y += 44;

  // Targets.
  text(ctx, 'TARGETS', PANEL.x + 28, y, 13, PALETTE.muted);
  y += 26;
  for (const target of level.targets) {
    const color = COLORS[target.color];
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(PANEL.x + 40, y - 5, 8, 0, Math.PI * 2);
    ctx.fill();
    text(ctx, `${COLOR_NAMES[target.color]} ${target.lit ? '— lit ✓' : target.wrong ? '— wrong colour!' : '— dark'}`, PANEL.x + 58, y, 16, target.lit ? PALETTE.ok : PALETTE.text);
    y += 28;
  }
  y += 12;

  // Timer bar.
  const frac = Math.max(0, level.timeLeft / def.time);
  text(ctx, `TIME  ${formatTime(level.timeLeft)}`, PANEL.x + 28, y, 15, frac < 0.2 ? PALETTE.danger : PALETTE.text);
  y += 10;
  ctx.fillStyle = '#232c47';
  roundRect(ctx, PANEL.x + 28, y, PANEL.width - 56, 12, 6);
  ctx.fill();
  ctx.fillStyle = frac < 0.2 ? PALETTE.danger : PALETTE.accent;
  if (frac > 0) {
    roundRect(ctx, PANEL.x + 28, y, (PANEL.width - 56) * frac, 12, 6);
    ctx.fill();
  }
  y += 46;

  text(ctx, `MOVES  ${level.moves}  (par ${def.par})`, PANEL.x + 28, y, 16, PALETTE.text);
  y += 30;
  text(ctx, `SCORE  ${game.totalScore.toLocaleString('en-US')}`, PANEL.x + 28, y, 16, PALETTE.text);
  y += 30;
  text(ctx, `BEST  ${(game.best || 0).toLocaleString('en-US')}`, PANEL.x + 28, y, 16, PALETTE.muted);
  y += 44;

  text(ctx, 'Click a mirror to rotate it.  Arrows move the cursor, Space rotates.', PANEL.x + 28, y, 14, PALETTE.muted);
  y += 24;
  text(ctx, `R restart level   ·   M sound ${game.muted ? 'off' : 'on'}   ·   Esc menu`, PANEL.x + 28, y, 14, PALETTE.muted);
}

function drawHeader(ctx, game) {
  text(ctx, 'PRISM PANES', 72, 62, 34, PALETTE.text, 'left', 800);
  text(ctx, 'route the light · light every ring', 344, 62, 16, PALETTE.muted);
  text(ctx, `TOTAL  ${game.totalScore.toLocaleString('en-US')}`, FIELD.width - 72, 62, 20, PALETTE.accent, 'right');
}

function overlay(ctx) {
  ctx.fillStyle = 'rgba(8, 11, 22, 0.72)';
  ctx.fillRect(0, 0, FIELD.width, FIELD.height);
}

function drawTitle(ctx, game) {
  const cx = FIELD.width / 2;
  text(ctx, 'PRISM', cx, 190, 92, PALETTE.text, 'center', 800);
  text(ctx, 'PANES', cx, 280, 92, PALETTE.accent, 'center', 800);
  text(ctx, 'Rotate the mirrors. Route the coloured light. Light every ring.', cx, 340, 22, PALETTE.muted, 'center');
  text(ctx, 'Click a mirror to turn it 90°. A beam bends at every mirror it meets,', cx, 380, 17, PALETTE.muted, 'center');
  text(ctx, 'stops at walls, and only lights a ring of its own colour.', cx, 406, 17, PALETTE.muted, 'center');
  text(ctx, '8 levels · beat par for 3 stars · the clock is always running', cx, 446, 17, PALETTE.muted, 'center');
  // A pulsing start button.
  const pulse = 1 + Math.sin(game.time * 3) * 0.04;
  ctx.save();
  ctx.translate(cx, 530);
  ctx.scale(pulse, pulse);
  ctx.fillStyle = PALETTE.accent;
  roundRect(ctx, -150, -32, 300, 64, 32);
  ctx.fill();
  text(ctx, '▶  START', 0, 8, 26, '#1b2133', 'center', 800);
  ctx.restore();
  text(ctx, 'Click or press Enter to play', cx, 596, 15, PALETTE.muted, 'center');
  if (game.best > 0) text(ctx, `Best total: ${game.best.toLocaleString('en-US')}`, cx, 628, 15, PALETTE.accent, 'center');
  // Decorative mini-scene: two beams meeting at one mirror.
  const deco = [
    { x: 470, y: 668, color: COLORS.red },
    { x: 810, y: 668, color: COLORS.blue },
  ];
  ctx.save();
  ctx.shadowColor = COLORS.red;
  ctx.shadowBlur = 14;
  ctx.strokeStyle = COLORS.red;
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(470, 668);
  ctx.lineTo(640, 668);
  ctx.stroke();
  ctx.shadowColor = COLORS.blue;
  ctx.strokeStyle = COLORS.blue;
  ctx.beginPath();
  ctx.moveTo(810, 668);
  ctx.lineTo(640, 668);
  ctx.stroke();
  ctx.restore();
  ctx.fillStyle = PALETTE.mirror;
  roundRect(ctx, 640 - 16, 668 - 16, 32, 32, 6);
  ctx.fill();
  ctx.strokeStyle = '#1b2133';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(640 - 9, 668 - 9);
  ctx.lineTo(640 + 9, 668 + 9);
  ctx.stroke();
  for (const d of deco) {
    ctx.fillStyle = d.color;
    ctx.beginPath();
    ctx.arc(d.x, d.y, 8, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawComplete(ctx, game) {
  overlay(ctx);
  const cx = FIELD.width / 2;
  const level = game.level;
  ctx.fillStyle = PALETTE.panel;
  roundRect(ctx, cx - 300, 170, 600, 330, 16);
  ctx.fill();
  ctx.strokeStyle = PALETTE.panelEdge;
  ctx.lineWidth = 1.5;
  roundRect(ctx, cx - 300, 170, 600, 330, 16);
  ctx.stroke();
  text(ctx, 'LEVEL CLEAR!', cx, 240, 40, PALETTE.ok, 'center', 800);
  drawStars(ctx, cx, 292, level.stars, 34);
  text(ctx, `${level.def.name}  ·  ${level.moves} moves (par ${level.def.par})`, cx, 348, 18, PALETTE.text, 'center');
  text(ctx, `Level score  +${level.levelScore.toLocaleString('en-US')}      Total  ${game.totalScore.toLocaleString('en-US')}`, cx, 386, 18, PALETTE.accent, 'center');
  const last = game.levelIndex >= 7;
  text(ctx, last ? 'That was the last level — see your results!' : 'Press N or click for the next level', cx, 440, 16, PALETTE.muted, 'center');
  ctx.fillStyle = PALETTE.accent;
  roundRect(ctx, cx - 130, 458, 260, 14, 7);
  ctx.fill();
}

function drawFailed(ctx, game) {
  overlay(ctx);
  const cx = FIELD.width / 2;
  ctx.fillStyle = PALETTE.panel;
  roundRect(ctx, cx - 300, 190, 600, 290, 16);
  ctx.fill();
  ctx.strokeStyle = PALETTE.panelEdge;
  ctx.lineWidth = 1.5;
  roundRect(ctx, cx - 300, 190, 600, 290, 16);
  ctx.stroke();
  text(ctx, 'TIME UP!', cx, 260, 40, PALETTE.danger, 'center', 800);
  text(ctx, `${game.level.def.name} — ${game.level.litCount} of ${game.level.targets.length} rings lit`, cx, 316, 18, PALETTE.text, 'center');
  text(ctx, 'The mirrors stay where you left them. Try again, faster.', cx, 352, 16, PALETTE.muted, 'center');
  text(ctx, 'Press R or click to retry the level', cx, 420, 16, PALETTE.accent, 'center');
}

function drawResults(ctx, game) {
  const cx = FIELD.width / 2;
  text(ctx, 'ALL LEVELS LIT!', cx, 150, 46, PALETTE.accent, 'center', 800);
  text(ctx, `TOTAL SCORE  ${game.totalScore.toLocaleString('en-US')}`, cx, 214, 30, PALETTE.text, 'center', 700);
  const totalStars = game.stars.reduce((a, b) => a + b, 0);
  drawStars(ctx, cx, 268, Math.round((totalStars / 24) * 3), 30);
  text(ctx, `${totalStars} of 24 stars`, cx, 300, 16, PALETTE.muted, 'center');
  let y = 350;
  for (let i = 0; i < 8; i += 1) {
    const left = cx - 260;
    const right = cx + 260;
    text(ctx, `${i + 1}.`, left, y, 17, PALETTE.muted);
    text(ctx, game.levelNames[i], left + 34, y, 17, PALETTE.text);
    ctx.fillStyle = game.stars[i] > 0 ? PALETTE.accent : '#39415c';
    ctx.font = `17px ${FONT}`;
    ctx.textAlign = 'right';
    ctx.fillText('★'.repeat(game.stars[i]) + '☆'.repeat(3 - game.stars[i]), right, y);
    y += 32;
  }
  text(ctx, `Best total: ${(game.best || 0).toLocaleString('en-US')}    ·    Press R to play again`, cx, 640, 16, PALETTE.muted, 'center');
}

/** Draw the whole frame for the current screen. */
export function render(ctx, game) {
  ctx.clearRect(0, 0, FIELD.width, FIELD.height);
  ctx.fillStyle = PALETTE.backdrop;
  ctx.fillRect(0, 0, FIELD.width, FIELD.height);
  if (game.screen === SCREEN_TITLE) {
    drawTitle(ctx, game);
    return;
  }
  if (game.screen === SCREEN_RESULTS) {
    drawResults(ctx, game);
    return;
  }
  drawHeader(ctx, game);
  drawBoard(ctx, game.level, game.hover, game.cursor, game.time);
  drawPanel(ctx, game);
  if (game.screen === SCREEN_COMPLETE) drawComplete(ctx, game);
  if (game.screen === SCREEN_FAILED) drawFailed(ctx, game);
}
