// Prism Panes — the screenshot scenes behind ?shot=start|play|end. Each one is a
// real game state reached by playing the real rules forward, never a mock:
// the play scene finishes the first two levels for real, then solves only the
// red beam of level 3; the end scene plays all eight levels to completion with
// fixed clocks, so the same URL always shows the same frame.

import { LEVELS } from './levels.js';
import { completeLevel, createLevel, rotateMirror, solutionRotations, traceBeams } from './engine.js';
import { SCREEN_PLAY, SCREEN_RESULTS, SCREEN_TITLE } from './render.js';

/** Play one level to completion with a fixed clock, banking its score. */
function finishLevel(game, index, timeFraction) {
  const level = createLevel(LEVELS[index]);
  game.level = level;
  game.levelIndex = index;
  traceBeams(level);
  for (const [x, y] of solutionRotations(LEVELS[index])) rotateMirror(level, x, y);
  level.timeLeft = level.def.time * timeFraction;
  completeLevel(level);
  game.stars[index] = level.stars;
  game.totalScore += level.levelScore;
}

/**
 * Set `game` to the named scene (start, play or end; any other name is start)
 * and return nothing — the game object itself is the scene.
 */
export function stageShot(name, game) {
  game.levelNames = LEVELS.map((level) => level.name);
  game.stars = new Array(LEVELS.length).fill(0);
  game.totalScore = 0;
  game.hover = null;
  game.cursor = null;
  if (name === 'end') {
    for (let index = 0; index < LEVELS.length; index += 1) finishLevel(game, index, 0.6);
    game.screen = SCREEN_RESULTS;
    game.best = Math.max(game.best || 0, game.totalScore);
    return;
  }
  if (name === 'play') {
    finishLevel(game, 0, 0.7);
    finishLevel(game, 1, 0.65);
    const level = createLevel(LEVELS[2]);
    game.level = level;
    game.levelIndex = 2;
    traceBeams(level);
    // Solve only the red beam; the blue one is still dark mid-puzzle.
    rotateMirror(level, 2, 2);
    rotateMirror(level, 2, 6);
    level.timeLeft = 47;
    game.cursor = { x: 5, y: 5 };
    game.screen = SCREEN_PLAY;
    return;
  }
  game.screen = SCREEN_TITLE;
}
