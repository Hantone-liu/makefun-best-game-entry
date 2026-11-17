// Prism Panes — mouse and keyboard, translated into board cells and actions.
// No game logic lives here: this file only reports what the player did.

import { BOARD } from './config.js';

/**
 * Which board cell a canvas pixel falls in, or null outside the board.
 * `rect` is the canvas's bounding box; the canvas draws a fixed 1280x720
 * logical field scaled to fit, so pixels are mapped back through that scale.
 */
export function cellFromEvent(event, canvas) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = 1280 / rect.width;
  const scaleY = 720 / rect.height;
  const x = (event.clientX - rect.left) * scaleX;
  const y = (event.clientY - rect.top) * scaleY;
  const col = Math.floor((x - BOARD.x) / BOARD.cell);
  const row = Math.floor((y - BOARD.y) / BOARD.cell);
  if (col < 0 || col >= BOARD.cols || row < 0 || row >= BOARD.rows) return null;
  return { x: col, y: row };
}

/** The same mapping for a hover position, used to highlight a cell. */
export function cellFromPoint(clientX, clientY, canvas) {
  return cellFromEvent({ clientX, clientY }, canvas);
}

/**
 * Wire up the canvas and the keyboard. Every callback receives plain data:
 * onRotate(cell), onHover(cell|null), onKey(action) where action is one of
 * 'confirm' | 'restart' | 'menu' | 'mute' | 'next' | 'up' | 'down' | 'left' |
 * 'right' | 'rotate'. Returns a cleanup function.
 */
export function bindInput(canvas, handlers) {
  const onClick = (event) => {
    // Always report the click, even outside the board (cell null): menu
    // screens start and advance on any click, including on their buttons.
    handlers.onRotate(cellFromEvent(event, canvas));
  };
  const onMove = (event) => {
    handlers.onHover(cellFromEvent(event, canvas));
  };
  const onLeave = () => handlers.onHover(null);
  const onKey = (event) => {
    const k = event.key;
    let action = null;
    if (k === 'ArrowUp' || k === 'w' || k === 'W') action = 'up';
    else if (k === 'ArrowDown' || k === 's' || k === 'S') action = 'down';
    else if (k === 'ArrowLeft' || k === 'a' || k === 'A') action = 'left';
    else if (k === 'ArrowRight' || k === 'd' || k === 'D') action = 'right';
    else if (k === ' ' || k === 'Enter') action = 'confirm';
    else if (k === 'r' || k === 'R') action = 'restart';
    else if (k === 'Escape') action = 'menu';
    else if (k === 'm' || k === 'M') action = 'mute';
    else if (k === 'n' || k === 'N') action = 'next';
    if (action !== null) {
      event.preventDefault();
      handlers.onKey(action);
    }
  };
  canvas.addEventListener('click', onClick);
  canvas.addEventListener('mousemove', onMove);
  canvas.addEventListener('mouseleave', onLeave);
  window.addEventListener('keydown', onKey);
  return () => {
    canvas.removeEventListener('click', onClick);
    canvas.removeEventListener('mousemove', onMove);
    canvas.removeEventListener('mouseleave', onLeave);
    window.removeEventListener('keydown', onKey);
  };
}
