// Prism Panes — boot, the main loop and the screen state machine. The rules live
// in engine.js, the drawing in render.js, the input in input.js; this file only
// wires them together and owns the clock.

import { BEST_KEY, FIELD, STEP } from './config.js';
import { LEVELS } from './levels.js';
import {
  completeLevel,
  createLevel,
  isSolved,
  rotateMirror,
  tick,
  traceBeams,
} from './engine.js';
import { bindInput } from './input.js';
import {
  isMuted,
  playConnect,
  playFail,
  playRotate,
  playTick,
  playWin,
  playWrong,
  toggleMute,
  unlockAudio,
} from './audio.js';
import { render, SCREEN_COMPLETE, SCREEN_FAILED, SCREEN_PLAY, SCREEN_RESULTS, SCREEN_TITLE } from './render.js';
import { stageShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const statusLine = document.getElementById('status');
canvas.width = FIELD.width;
canvas.height = FIELD.height;

const params = new URLSearchParams(window.location.search);
const shotName = params.get('shot');
const SHOT_MODE = shotName !== null;

function loadBest() {
  try {
    return Number(window.localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
}

function saveBest(score) {
  try {
    window.localStorage.setItem(BEST_KEY, String(score));
  } catch {
    // Private browsing or no storage: the score just is not kept.
  }
}

const game = {
  screen: SCREEN_TITLE,
  levelIndex: 0,
  level: createLevel(LEVELS[0]),
  totalScore: 0,
  stars: new Array(LEVELS.length).fill(0),
  levelNames: LEVELS.map((level) => level.name),
  best: loadBest(),
  muted: isMuted(),
  hover: null,
  cursor: { x: 0, y: 0 },
  time: 0,
  completeAt: null,
  lastTickSecond: null,
};

traceBeams(game.level);

function announce(message) {
  statusLine.textContent = message;
}

function loadLevel(index) {
  game.levelIndex = index;
  game.level = createLevel(LEVELS[index]);
  game.completeAt = null;
  game.lastTickSecond = null;
  game.cursor = { x: 0, y: 0 };
  traceBeams(game.level);
  game.screen = SCREEN_PLAY;
  announce(`Level ${index + 1}: ${LEVELS[index].name}. ${LEVELS[index].hint}`);
}

function startGame() {
  game.totalScore = 0;
  game.stars = new Array(LEVELS.length).fill(0);
  loadLevel(0);
}

function nextLevel() {
  if (game.levelIndex >= LEVELS.length - 1) {
    game.screen = SCREEN_RESULTS;
    if (game.totalScore > game.best) {
      game.best = game.totalScore;
      saveBest(game.best);
    }
    announce(`All levels complete. Total score ${game.totalScore}.`);
    return;
  }
  loadLevel(game.levelIndex + 1);
}

function retryLevel() {
  loadLevel(game.levelIndex);
}

function finishLevelNow() {
  const result = completeLevel(game.level);
  game.stars[game.levelIndex] = result.stars;
  game.totalScore += result.score;
  game.completeAt = null;
  game.screen = SCREEN_COMPLETE;
  playWin();
  announce(`Level clear! ${result.stars} stars, ${result.score} points.`);
}

function tryRotate(cell) {
  const level = game.level;
  const before = level.litCount;
  const hadWrong = level.targets.some((t) => t.wrong);
  if (!rotateMirror(level, cell.x, cell.y)) return;
  playRotate();
  if (level.litCount > before) playConnect();
  else if (!hadWrong && level.targets.some((t) => t.wrong)) playWrong();
  if (isSolved(level) && game.completeAt === null) {
    game.completeAt = game.time + 0.6;
  }
}

function onRotate(cell) {
  unlockAudio();
  // One click handler for every screen: a click that leaves a menu screen
  // never also rotates a mirror on the board behind it. A null cell (a click
  // outside the board, e.g. on the START button) still works the menus.
  if (game.screen === SCREEN_TITLE) {
    startGame();
    return;
  }
  if (game.screen === SCREEN_COMPLETE) {
    nextLevel();
    return;
  }
  if (game.screen === SCREEN_FAILED) {
    retryLevel();
    return;
  }
  if (game.screen === SCREEN_RESULTS) {
    startGame();
    return;
  }
  if (cell === null) return;
  tryRotate(cell);
}

function onHover(cell) {
  game.hover = cell;
}

function onKey(action) {
  unlockAudio();
  if (action === 'mute') {
    game.muted = toggleMute();
    return;
  }
  if (game.screen === SCREEN_TITLE) {
    if (action === 'confirm') startGame();
    return;
  }
  if (game.screen === SCREEN_COMPLETE) {
    if (action === 'confirm' || action === 'next') nextLevel();
    else if (action === 'restart') retryLevel();
    else if (action === 'menu') game.screen = SCREEN_TITLE;
    return;
  }
  if (game.screen === SCREEN_FAILED) {
    if (action === 'restart' || action === 'confirm') retryLevel();
    else if (action === 'menu') game.screen = SCREEN_TITLE;
    return;
  }
  if (game.screen === SCREEN_RESULTS) {
    if (action === 'restart' || action === 'confirm') startGame();
    else if (action === 'menu') game.screen = SCREEN_TITLE;
    return;
  }
  // Playing.
  if (action === 'restart') {
    retryLevel();
    return;
  }
  if (action === 'menu') {
    game.screen = SCREEN_TITLE;
    return;
  }
  if (action === 'up') game.cursor.y = Math.max(0, game.cursor.y - 1);
  else if (action === 'down') game.cursor.y = Math.min(7, game.cursor.y + 1);
  else if (action === 'left') game.cursor.x = Math.max(0, game.cursor.x - 1);
  else if (action === 'right') game.cursor.x = Math.min(7, game.cursor.x + 1);
  else if (action === 'confirm') tryRotate({ x: game.cursor.x, y: game.cursor.y });
}

canvas.addEventListener('click', () => unlockAudio());
bindInput(canvas, { onRotate, onHover, onKey });

if (SHOT_MODE) {
  // A screenshot scene: fixed clock, no timer, no input-driven change.
  stageShot(shotName, game);
  game.time = 1.234;
  render(ctx, game);
} else {
  let last = performance.now();
  let accumulator = 0;
  function frame(now) {
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    game.time += dt;
    if (game.screen === SCREEN_PLAY) {
      accumulator += dt;
      while (accumulator >= STEP) {
        tick(game.level, STEP);
        accumulator -= STEP;
      }
      if (game.level.status === 'failed') {
        game.screen = SCREEN_FAILED;
        playFail();
        announce('Time up! Press R to retry the level.');
      } else {
        const whole = Math.ceil(game.level.timeLeft);
        if (whole <= 10 && whole !== game.lastTickSecond && whole > 0) {
          game.lastTickSecond = whole;
          playTick();
        }
        if (game.completeAt !== null && game.time >= game.completeAt) finishLevelNow();
      }
    }
    render(ctx, game);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
