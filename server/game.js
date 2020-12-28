/* eslint-disable no-console */
const socket = require('./socket');
const twl = require('./data/twl.json');

require('colors');

/**
 * The data object contains information about all currently active rooms.
 * roomname: string {
 *    board: [[
 *      {
 *        id: number,
 *        temp: boolean,
 *        letter?: string,
 *        modifier?: string,
 *        owner?: string,
 *        color?: string,
 *      }
 *    ]]
 *    players: [
 *      {
 *        name: string,
 *        score: number,
 *        words: [string array],
 *        letters: [string array],
 *      }
 *    ]
 * }
 */
const data = {};

const SIZE = 15;

const LETTERS = {
  A: [1, 10],
  B: [4, 2],
  C: [4, 2],
  D: [2, 5],
  E: [1, 12],
  F: [4, 2],
  G: [3, 3],
  H: [4, 3],
  I: [1, 9],
  J: [10, 1],
  K: [5, 1],
  L: [1, 4],
  M: [3, 2],
  N: [1, 6],
  O: [1, 7],
  P: [4, 2],
  Q: [10, 1],
  R: [1, 6],
  S: [1, 5],
  T: [1, 7],
  U: [2, 4],
  V: [4, 2],
  W: [4, 2],
  X: [8, 1],
  Y: [4, 2],
  Z: [10, 1],
  BLANK: [0, 2],
};

const SPECIALS = {
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

const joinRoom = (player, room) => {
  const defaultPlayer = {
    name: player,
    score: 0,
    words: [],
    letters: ['Q', 'W', 'E', 'R', 'T', 'Y'],
  };

  if (!data[room]) {
    data[room] = {
      board: generateBoard(SIZE, SPECIALS),
      players: [defaultPlayer],
    };
    console.log(`New room created: ${room}`.cyan);
  } else {
    data[room].players.push(defaultPlayer);
  }
  socket.sendUpdate(room, data[room]);
};

const generateBoard = (size, specials) => {
  const board = [];
  for (let row = 0; row < size; row += 1) {
    board.push([]);
    for (let col = 0; col < size; col += 1) {
      board[row].push({
        id: row * size + col,
        temp: false,
        letter: '',
        modifier: '',
        owner: '',
      });
      Object.keys(specials).forEach(special => {
        if (
          specials[special].some(item => item[0] === row && item[1] === col)
        ) {
          board[row][col].modifier = special;
        }
      });
    }
  }
  return board;
};

const getData = room => data[room];
const getPlayerData = (room, player) =>
  data[room].players.find(pl => pl.name === player);
const setPlayerData = (room, player, prop, value) => {
  data[room].players.find(pl => pl.name === player)[prop] = value;
};
const addToPlayerData = (room, player, prop, value) => {
  data[room].players.find(pl => pl.name === player)[prop] += value;
};
const setLetters = (room, player, letters) => {
  setPlayerData(room, player, 'letters', letters);
};
const deletePlayer = (room, player) => {
  if (data[room])
    data[room].players = data[room].players.filter(
      item => item.name !== player,
    );
};
const isWord = word => {
  const cleanedWord = word.trim().toLowerCase();
  return twl[cleanedWord];
};

const validateBoard = (board, player, room) => {
  const size = board.length;
  const center = Math.floor(size / 2);
  // check if center is filled
  if (board[center][center].letter === '') {
    socket.sendError(`You must start at the center!`);
    return false;
  }
  // make sure pieces are connected
  const connected = generateConnected(board, center, center, []);
  let rowToUse;
  let colToUse;

  for (let row = 0; row < board.length; row += 1) {
    for (let col = 0; col < board.length; col += 1) {
      if (board[row][col].temp) {
        if (connected.includes(row * size + col)) {
          rowToUse = row;
          colToUse = col;
          if (!checkInLine(board, row, col)) {
            socket.sendError(`Tiles must all be placed in a line.`);
            return false;
          }
        } else {
          socket.sendError(`All pieces must be connected.`);
          return false;
        }
      }
    }
  }

  if (rowToUse === undefined) {
    socket.sendError(`Place at least one tile.`);
    return false;
  }

  const [newBoard, words] = generateWords(board, rowToUse, colToUse, []);

  // make sure pieces are together
  for (let row = 0; row < newBoard.length; row += 1) {
    for (let col = 0; col < newBoard.length; col += 1) {
      if (newBoard[row][col].temp) {
        socket.sendError(`Tiles must all be placed in a line.`);
        return false;
      }
    }
  }

  if (!newBoard) return false;

  if (words.length === 0) {
    socket.sendError(`Place more than one piece at the center.`);
    return false;
  }

  words.forEach(word => {
    console.log(`${player} played ${word.word} for ${word.points} points`.cyan);
    socket.sendAnnouncement(
      `${player} played ${word.word} for ${word.points} points`,
    );
    addToPlayerData(room, player, 'score', word.points);
  });

  addToPlayerData(room, player, 'words', words);
  data[room].board = newBoard;
  socket.sendUpdate(room, data[room]);
  return true;
};

const generateConnected = (board, row, col, visited) => {
  const id = (r, c) => r * board.length + c;

  if (visited.includes(id(row, col))) {
    return [];
  }
  if (row > board.length || row < 0 || col > board.length || col < 0) {
    return [];
  }
  if (board[row][col].letter === '') {
    return [];
  }
  return (
    [id(row, col)] +
    generateConnected(board, row + 1, col, visited + [id(row, col)]) +
    generateConnected(board, row - 1, col, visited + [id(row, col)]) +
    generateConnected(board, row, col + 1, visited + [id(row, col)]) +
    generateConnected(board, row, col - 1, visited + [id(row, col)])
  );
};

const checkInLine = (board, row, col) => {
  let lock;
  for (let r = 0; r < board.length; r += 1) {
    if (board[r][col].temp && r !== row) lock = 'row';
  }
  for (let c = 0; c < board.length; c += 1) {
    if (board[row][c].temp && c !== row) {
      if (lock === 'row') {
        return false;
      }
    }
  }
  return true;
};

const generateWords = (board, row, col, visited) => {
  const id = (r, c) => r * board.length + c;
  const words = [];
  const newVisited = Object.assign([], visited);
  const recursiveQueue = [];

  let vertWord = '';
  let horizWord = '';
  let vertScore = 0;
  let horizScore = 0;
  let horizMult = 1;
  let vertMult = 1;
  let horizConflict = false;
  let vertConflict = false;
  let lock;

  const processChild = (r, c) => {
    if (board[r][c].temp) {
      console.log(JSON.stringify(board[r][c]));
      const [childBoard, childWords] = generateWords(
        newBoard,
        r,
        c,
        newVisited,
      );
      newBoard = childBoard;
      // newBoard[r][c].temp = false;
      // newBoard[row][col].challengable = true;
      words.push(...childWords);
    }
  };

  const getPts = (r, c, horiz) => {
    const pts = LETTERS[board[r][c].letter][0];
    if (board[r][c].modifier === 'DW' || board[r][c].modifier === 'CENTER') {
      if (horiz) horizMult *= 2;
      else vertMult *= 2;
    } else if (board[r][c].modifier === 'TW') {
      if (horiz) horizMult *= 3;
      else vertMult *= 3;
    } else if (board[r][c].modifier === 'DL') return pts * 2;
    else if (board[r][c].modifier === 'TL') return pts * 3;
    return pts;
  };

  if (
    // visited.includes(id(row, col)) ||
    row > board.length ||
    row < 0 ||
    col > board.length ||
    col < 0
  ) {
    return [board, []];
  }
  let newBoard = Object.assign([], board);
  // if (board[row][col].temp) {
  newBoard[row][col].temp = false;
  newBoard[row][col].challengable = true;
  newVisited.push(id(row, col));

  console.log(
    `${board[row][col].letter}, ${board[row + 1][col].letter}, ${
      board[row - 1][col].letter
    }, ${board[row][col + 1].letter}, ${board[row][col - 1].letter}`,
  );
  // Traverse horizontally
  if (board[row + 1][col].letter !== '') {
    let r = row;
    lock = 'H+';
    while (r < board.length && board[r][col].letter !== '') {
      horizWord += board[r][col].letter;
      horizScore += getPts(r, col, true);
      if (!newVisited.includes(id(r, col))) {
        recursiveQueue.push([r, col]);
      } else if (r !== row) {
        horizConflict = true;
      }
      newVisited.push(id(r, col));
      r += 1;
    }
  }

  if (board[row - 1][col].letter !== '') {
    let r = row;
    if (lock === 'H+') r -= 1;
    while (r >= 0 && board[r][col].letter !== '') {
      horizWord = board[r][col].letter + horizWord;
      horizScore += getPts(r, col, true);
      if (!newVisited.includes(id(r, col))) {
        recursiveQueue.push([r, col]);
      } else if (r !== row) {
        horizConflict = true;
      }
      newVisited.push(id(r, col));
      r -= 1;
    }
  }
  // Traverse vertically
  if (board[row][col + 1].letter !== '') {
    console.log('V+');
    lock = 'V+';
    let c = col;
    while (c < board.length && board[row][c].letter !== '') {
      vertWord += board[row][c].letter;
      vertScore += getPts(row, c, false);
      if (!newVisited.includes(id(row, c))) {
        recursiveQueue.push([row, c]);
      } else if (c !== col) {
        vertConflict = true;
      }
      newVisited.push(id(row, c));
      c += 1;
    }
  }
  if (board[row][col - 1].letter !== '') {
    console.log('V-');
    let c = col;
    if (lock === 'V+') c -= 1;
    while (c >= 0 && board[row][c].letter !== '') {
      vertWord = board[row][c].letter + vertWord;
      vertScore += getPts(row, c, false);
      if (!newVisited.includes(id(row, c))) {
        recursiveQueue.push([row, c]);
      } else if (c !== col) {
        vertConflict = true;
      }
      newVisited.push(id(row, c));
      c -= 1;
    }
  }
  console.log(JSON.stringify(recursiveQueue));
  recursiveQueue.forEach(item => {
    processChild(item[0], item[1]);
  });

  if (!horizConflict && horizWord !== '')
    words.push({
      word: horizWord,
      points: horizScore * horizMult,
    });
  if (!vertConflict && vertWord !== '')
    words.push({
      word: vertWord,
      points: vertScore * vertMult,
    });

  return [newBoard, words];
};

exports.joinRoom = joinRoom;
exports.getData = getData;
exports.setLetters = setLetters;
exports.getPlayerData = getPlayerData;
exports.deletePlayer = deletePlayer;
exports.isWord = isWord;
exports.validateBoard = validateBoard;
