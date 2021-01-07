const LETTERS_75 = {
  A: [1, 7],
  B: [3, 2],
  C: [3, 2],
  D: [2, 2],
  E: [1, 7],
  F: [4, 2],
  G: [2, 2],
  H: [4, 2],
  I: [1, 7],
  J: [8, 1],
  K: [5, 1],
  L: [1, 3],
  M: [3, 2],
  N: [1, 5],
  O: [1, 5],
  P: [3, 2],
  Q: [10, 1],
  R: [1, 4],
  S: [1, 3],
  T: [1, 3],
  U: [1, 3],
  V: [4, 1],
  W: [4, 2],
  X: [8, 1],
  Y: [4, 2],
  Z: [10, 1],
  BLANK: [0, 2],
};
const LETTERS_100 = {
  A: [1, 9],
  B: [3, 2],
  C: [3, 2],
  D: [2, 4],
  E: [1, 12],
  F: [4, 2],
  G: [2, 3],
  H: [4, 2],
  I: [1, 9],
  J: [8, 1],
  K: [5, 1],
  L: [1, 4],
  M: [3, 2],
  N: [1, 6],
  O: [1, 8],
  P: [3, 2],
  Q: [10, 1],
  R: [1, 6],
  S: [1, 4],
  T: [1, 6],
  U: [1, 4],
  V: [4, 2],
  W: [4, 2],
  X: [8, 1],
  Y: [4, 2],
  Z: [10, 1],
  BLANK: [0, 2],
};
const LETTERS_150 = {
  A: [1, 14],
  B: [3, 3],
  C: [3, 3],
  D: [2, 6],
  E: [1, 18],
  F: [4, 3],
  G: [2, 4],
  H: [4, 3],
  I: [1, 13],
  J: [8, 2],
  K: [5, 2],
  L: [1, 6],
  M: [3, 3],
  N: [1, 8],
  O: [1, 12],
  P: [3, 3],
  Q: [10, 2],
  R: [1, 8],
  S: [1, 7],
  T: [1, 8],
  U: [1, 6],
  V: [4, 3],
  W: [4, 3],
  X: [8, 2],
  Y: [4, 3],
  Z: [10, 2],
  BLANK: [0, 3],
};
const LETTERS_TEST = {
  A: [1, 7],
};

const SPECIALS_S = {
  TW: [[0, 0], [0, 5], [0, 10], [5, 0], [5, 10], [10, 0], [10, 5], [10, 10]],
  DW: [
    [1, 1],
    [2, 2],
    [8, 8],
    [9, 9],
    [1, 9],
    [2, 8],
    [9, 1],
    [8, 2],
    [4, 4],
    [6, 6],
    [4, 6],
    [6, 4],
  ],
  DL: [[1, 4], [1, 6], [4, 1], [6, 1], [9, 4], [9, 6], [4, 9], [6, 9]],
  TL: [[3, 3], [7, 7], [7, 3], [3, 7], [2, 5], [5, 2], [8, 5], [5, 8]],
  CENTER: [[5, 5]],
};
const SPECIALS_M = {
  TW: [[0, 0], [0, 7], [0, 14], [7, 0], [7, 14], [14, 0], [14, 7], [14, 14]],
  DW: [
    [1, 1],
    [2, 2],
    [3, 3],
    [4, 4],
    [10, 10],
    [11, 11],
    [12, 12],
    [13, 13],
    [13, 1],
    [12, 2],
    [11, 3],
    [10, 4],
    [1, 13],
    [2, 12],
    [3, 11],
    [4, 10],
  ],
  DL: [
    [0, 3],
    [0, 11],
    [14, 3],
    [14, 11],
    [3, 0],
    [11, 0],
    [3, 14],
    [11, 14],
    [6, 2],
    [7, 3],
    [8, 2],
    [2, 6],
    [3, 7],
    [2, 8],
    [6, 12],
    [7, 11],
    [8, 12],
    [12, 6],
    [11, 7],
    [12, 8],
    [6, 6],
    [6, 8],
    [8, 6],
    [8, 8],
  ],
  TL: [
    [5, 1],
    [9, 1],
    [1, 5],
    [1, 9],
    [13, 5],
    [13, 9],
    [9, 13],
    [5, 13],
    [5, 9],
    [5, 5],
    [9, 9],
    [9, 5],
  ],
  CENTER: [[7, 7]],
};
const SPECIALS_L = {
  TW: [
    [4, 4],
    [4, 9],
    [4, 14],
    [9, 4],
    [9, 14],
    [14, 4],
    [14, 9],
    [14, 14],
    [0, 0],
    [0, 18],
    [18, 0],
    [18, 18],
    [0, 9],
    [9, 0],
    [18, 9],
    [9, 18],
  ],
  DW: [
    [5, 5],
    [6, 6],
    [12, 12],
    [13, 13],
    [5, 13],
    [6, 12],
    [13, 5],
    [12, 6],
    [8, 8],
    [10, 10],
    [8, 10],
    [10, 8],
    [1, 1],
    [2, 2],
    [3, 3],
    [15, 15],
    [16, 16],
    [17, 17],
    [1, 17],
    [17, 1],
    [2, 16],
    [16, 2],
    [3, 15],
    [15, 3],
  ],
  DL: [
    [5, 10],
    [8, 5],
    [10, 5],
    [13, 8],
    [13, 10],
    [8, 13],
    [10, 13],
    [6, 2],
    [9, 2],
    [12, 2],
    [6, 16],
    [9, 16],
    [12, 16],
    [2, 6],
    [2, 9],
    [2, 12],
    [16, 6],
    [16, 9],
    [16, 12],
  ],
  TL: [
    [7, 7],
    [11, 11],
    [11, 7],
    [7, 11],
    [6, 9],
    [9, 6],
    [12, 9],
    [9, 12],
    [0, 3],
    [0, 6],
    [0, 12],
    [0, 15],
    [3, 0],
    [6, 0],
    [12, 0],
    [15, 0],
    [18, 3],
    [18, 6],
    [18, 12],
    [18, 15],
    [3, 18],
    [6, 18],
    [12, 18],
    [15, 18],
  ],
  CENTER: [[9, 9]],
};

exports.LETTERS = {
  75: LETTERS_75,
  100: LETTERS_100,
  150: LETTERS_150,
  TEST: LETTERS_TEST,
};
exports.SPECIALS = {
  S: SPECIALS_S,
  M: SPECIALS_M,
  L: SPECIALS_L,
};
exports.SIZE = {
  S: 11,
  M: 15,
  L: 19,
};
