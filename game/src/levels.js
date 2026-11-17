// Prism Panes — the eight levels, designed by construction: every solution path was
// laid out first (emitter -> mirrors -> target), then each rotatable mirror was
// scrambled to the wrong orientation, so the stored `solution` always solves it.
// A mirror whose `orient` already equals its `solution` starts solved on purpose in
// the later levels, so blindly clicking every mirror breaks the level.
//
// Cell coordinates are (x = column 0..7, y = row 0..7). Directions: N E S W.
// Mirrors: orient is the starting orientation, solution is the orientation that
// routes the beam correctly. fixed mirrors cannot be rotated (decoration that
// still reflects a beam that reaches it).

export const LEVELS = [
  {
    name: 'First Light',
    hint: 'Click a mirror to rotate it. Guide the red beam into the red ring.',
    time: 60,
    par: 1,
    emitters: [{ x: 0, y: 3, dir: 'E', color: 'red' }],
    targets: [{ x: 3, y: 0, color: 'red' }],
    mirrors: [{ x: 3, y: 3, orient: '\\', solution: '/', fixed: false }],
    walls: [],
  },
  {
    name: 'Around the Corner',
    hint: 'Two turns now. Watch where each beam goes after every rotation.',
    time: 75,
    par: 2,
    emitters: [{ x: 0, y: 1, dir: 'E', color: 'red' }],
    targets: [{ x: 1, y: 5, color: 'red' }],
    mirrors: [
      { x: 5, y: 1, orient: '/', solution: '\\', fixed: false },
      { x: 5, y: 5, orient: '\\', solution: '/', fixed: false },
    ],
    walls: [],
  },
  {
    name: 'Two Beams',
    hint: 'Red and blue run at once. A mirror only bends the beam that reaches it.',
    time: 90,
    par: 4,
    emitters: [
      { x: 0, y: 2, dir: 'E', color: 'red' },
      { x: 7, y: 5, dir: 'W', color: 'blue' },
    ],
    targets: [
      { x: 0, y: 6, color: 'red' },
      { x: 7, y: 7, color: 'blue' },
    ],
    mirrors: [
      { x: 2, y: 2, orient: '/', solution: '\\', fixed: false },
      { x: 2, y: 6, orient: '\\', solution: '/', fixed: false },
      { x: 5, y: 5, orient: '\\', solution: '/', fixed: false },
      { x: 5, y: 7, orient: '/', solution: '\\', fixed: false },
    ],
    walls: [],
  },
  {
    name: 'Crossfire',
    hint: 'Walls stop a beam cold. The grey mirror is bolted down — it never turns.',
    time: 90,
    par: 4,
    emitters: [
      { x: 0, y: 0, dir: 'E', color: 'red' },
      { x: 7, y: 3, dir: 'W', color: 'blue' },
    ],
    targets: [
      { x: 2, y: 6, color: 'red' },
      { x: 7, y: 5, color: 'blue' },
    ],
    mirrors: [
      { x: 6, y: 0, orient: '/', solution: '\\', fixed: false },
      { x: 6, y: 6, orient: '\\', solution: '/', fixed: false },
      { x: 4, y: 3, orient: '\\', solution: '/', fixed: false },
      { x: 4, y: 5, orient: '/', solution: '\\', fixed: false },
      { x: 1, y: 4, orient: '\\', solution: '\\', fixed: true },
    ],
    walls: [{ x: 3, y: 3 }],
  },
  {
    name: 'Three Colors',
    hint: 'A third colour joins. Each target only accepts its own colour.',
    time: 120,
    par: 6,
    emitters: [
      { x: 0, y: 4, dir: 'E', color: 'red' },
      { x: 7, y: 1, dir: 'W', color: 'blue' },
      { x: 3, y: 0, dir: 'S', color: 'green' },
    ],
    targets: [
      { x: 0, y: 7, color: 'red' },
      { x: 7, y: 4, color: 'blue' },
      { x: 1, y: 0, color: 'green' },
    ],
    mirrors: [
      { x: 3, y: 4, orient: '/', solution: '\\', fixed: false },
      { x: 3, y: 7, orient: '\\', solution: '/', fixed: false },
      { x: 5, y: 1, orient: '\\', solution: '/', fixed: false },
      { x: 5, y: 4, orient: '/', solution: '\\', fixed: false },
      { x: 3, y: 2, orient: '\\', solution: '/', fixed: false },
      { x: 1, y: 2, orient: '/', solution: '\\', fixed: false },
    ],
    walls: [],
  },
  {
    name: 'The Gauntlet',
    hint: 'Longer runs, and one mirror already points the right way. Do not touch it.',
    time: 120,
    par: 4,
    emitters: [
      { x: 0, y: 7, dir: 'E', color: 'red' },
      { x: 7, y: 0, dir: 'S', color: 'blue' },
    ],
    targets: [
      { x: 0, y: 2, color: 'red' },
      { x: 6, y: 0, color: 'blue' },
    ],
    mirrors: [
      { x: 2, y: 7, orient: '\\', solution: '/', fixed: false },
      { x: 2, y: 2, orient: '/', solution: '\\', fixed: false },
      { x: 7, y: 3, orient: '\\', solution: '/', fixed: false },
      { x: 4, y: 3, orient: '\\', solution: '\\', fixed: false },
      { x: 4, y: 0, orient: '\\', solution: '/', fixed: false },
      { x: 6, y: 5, orient: '\\', solution: '\\', fixed: false },
    ],
    walls: [
      { x: 5, y: 5 },
      { x: 1, y: 5 },
    ],
  },
  {
    name: 'Prism Maze',
    hint: 'Three beams, seven mirrors, beams crossing mid-board. Plan before you click.',
    time: 150,
    par: 6,
    emitters: [
      { x: 0, y: 1, dir: 'E', color: 'red' },
      { x: 1, y: 7, dir: 'N', color: 'blue' },
      { x: 7, y: 6, dir: 'W', color: 'green' },
    ],
    targets: [
      { x: 3, y: 5, color: 'red' },
      { x: 2, y: 7, color: 'blue' },
      { x: 7, y: 2, color: 'green' },
    ],
    mirrors: [
      { x: 6, y: 1, orient: '/', solution: '\\', fixed: false },
      { x: 6, y: 5, orient: '\\', solution: '/', fixed: false },
      { x: 1, y: 4, orient: '\\', solution: '/', fixed: false },
      { x: 4, y: 4, orient: '\\', solution: '\\', fixed: false },
      { x: 4, y: 7, orient: '\\', solution: '/', fixed: false },
      { x: 5, y: 6, orient: '/', solution: '\\', fixed: false },
      { x: 5, y: 2, orient: '\\', solution: '/', fixed: false },
    ],
    walls: [],
  },
  {
    name: 'Grand Finale',
    hint: 'Everything at once. Two mirrors start solved — the beams will tell you which.',
    time: 180,
    par: 5,
    emitters: [
      { x: 0, y: 3, dir: 'E', color: 'red' },
      { x: 7, y: 4, dir: 'W', color: 'blue' },
      { x: 4, y: 0, dir: 'S', color: 'green' },
    ],
    targets: [
      { x: 0, y: 6, color: 'red' },
      { x: 7, y: 7, color: 'blue' },
      { x: 3, y: 0, color: 'green' },
    ],
    mirrors: [
      { x: 2, y: 3, orient: '/', solution: '\\', fixed: false },
      { x: 2, y: 6, orient: '\\', solution: '/', fixed: false },
      { x: 5, y: 4, orient: '/', solution: '/', fixed: false },
      { x: 5, y: 7, orient: '/', solution: '\\', fixed: false },
      { x: 4, y: 2, orient: '\\', solution: '/', fixed: false },
      { x: 1, y: 2, orient: '\\', solution: '\\', fixed: false },
      { x: 1, y: 0, orient: '\\', solution: '/', fixed: false },
      { x: 6, y: 6, orient: '/', solution: '/', fixed: true },
    ],
    walls: [
      { x: 3, y: 5 },
      { x: 6, y: 2 },
    ],
  },
];
