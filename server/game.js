/* eslint-disable no-console */
const socket = require('./socket');
const twl = require('./data/twl.json');

require('colors');

/**
 * The data object contains information about all currently active rooms.
 * roomname: string {
 *    status: waiting/playing/challenging,
 *    time: number (seconds),
 *    bag: string,
 *    ready: [string array],
 *    round: number,
 *    board: [[
 *      {
 *        id: number,
 *        temp: boolean,
 *        letter?: string,
 *        modifier?: string,
 *        owner?: string,
 *        color?: string,
 *        used: boolean,
 *      }
 *    ]]
 *    players: [
 *      {
 *        name: string,
 *        score: number,
 *        words: [{
 *          word: string,
 *          score: number,
 *          challengable: boolean,
 *        }],
 *        letters: [string array],
 *        loseTurn: boolean,
 *        kick: [string array],
 *      }
 *    ]
 * }
 */
const data = {};

// Stores the game loop interval objects for each active room.
// Destroy the interval when the game ends.
const loops = {};

const SIZE = 15;

const LETTERS = {
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

const joinRoom = (s, player, room) => {
  const defaultPlayer = {
    name: player,
    score: 0,
    words: [],
    letters: [],
    loseTurn: false,
    kick: [],
  };

  if (!data[room]) {
    data[room] = {
      board: generateBoard(SIZE, SPECIALS),
      players: [defaultPlayer],
      status: 'waiting',
      time: 0,
      bag: generateBag(LETTERS),
      ready: [],
      round: 1,
    };
    console.log(`New room created: ${room}`.cyan);
  } else if (data[room].status === 'waiting') {
    data[room].players.push(defaultPlayer);
  } else {
    socket.emit(s, 'serverSendJoinError', {
      error: 'Error: game already started',
    });
  }
  socket.sendUpdate(room, data[room]);
};

const startGame = room => {
  for (let i = 0; i < data[room].players.length; i += 1) {
    const player = data[room].players[i];
    data[room].players[i].letters.push(...drawTiles(room, player));
  }
  data[room].status = 'playing';
  data[room].time = 90;
  data[room].ready = [];
  console.log(`The game in room ${room} has started!`.magenta);
  socket.sendGlobalAnnouncement(room, `Round 1 begins.`, 'blue');
  socket.sendUpdate(room, data[room]);
  loops[room] = gameLoop(room);
};

const gameLoop = room =>
  setInterval(() => {
    if (data[room] === undefined) {
      clearInterval(loops[room]);
      delete loops[room];
      return;
    }
    data[room].time -= 1;

    if (
      data[room].time === 0 ||
      data[room].ready.length === data[room].players.length
    ) {
      data[room].ready = [];
      if (data[room].status === 'playing') {
        data[room].status = 'challenging';
        socket.globalEmit(room, 'serverSendChallengingTime');
        socket.sendGlobalAnnouncement(
          room,
          `Round ${data[room].round} has ended. Press ready to continue.`,
          'blue',
        );
        data[room].time = 30;
        data[room].round += 1;
        data[room].players.forEach((player, index) => {
          data[room].players[index].loseTurn = false;
        });
        data[room].players.sort((a, b) => b.score - a.score);
      } else if (data[room].status === 'challenging') {
        data[room].status = 'playing';
        let notGameOver = false;
        for (let i = 0; i < data[room].players.length; i += 1) {
          const player = data[room].players[i];
          data[room].players[i].lastTurn = [];
          data[room].players[i].letters.push(...drawTiles(room, player));
          data[room].players[i].words.forEach((word, index) => {
            if (player.words[index].challengable) {
              data[room].players[i].words[index].challengable = false;
              if (
                !player.words[index].word.includes('*') &&
                twl[player.words[index].word.toLowerCase()] === undefined
              ) {
                socket.sendGlobalAnnouncement(
                  room,
                  `${player.name} played an illegal word ${
                    player.words[index].word
                  }, but nobody challenged it!`,
                  'orange',
                );
              }
            }
          });
          if (data[room].players[i].letters.length > 0) {
            notGameOver = true;
          }
        }

        data[room].players.sort((a, b) => b.score - a.score);
        console.log(
          `Tiles remaining in ${room}: ${data[room].bag.length}`.blue,
        );

        if (!notGameOver) {
          data[room].status = 'gameOver';
          socket.sendGlobalAnnouncement(
            room,
            `Game over! ${data[room].players[0].name} wins with ${
              data[room].players[0].score
            } points!`,
          );
        } else {
          socket.sendGlobalAnnouncement(
            room,
            `Round ${data[room].round} begins. There are ${
              data[room].bag.length
            } tiles remaining.`,
            'blue',
          );
          data[room].time = 60;
        }
        // for (let row = 0; row < data[room].board.length; row += 1) {
        //   for (let col = 0; col < data[room].board.length; col += 1) {
        //     data[room].board[row][col].challengable = false;
        //   }
        // }
      }
    }
    socket.sendUpdate(room, data[room]);
  }, 1000);

const drawTiles = (room, player) => {
  const numToDraw = 7 - player.letters.length;
  const tiles = [];
  for (let i = 0; i < numToDraw; i += 1) {
    if (data[room].bag.length === 0) return tiles;
    const tile = Math.floor(Math.random() * data[room].bag.length);
    tiles.push(data[room].bag.substring(tile, tile + 1));
    data[room].bag =
      data[room].bag.substring(0, tile) +
      data[room].bag.substring(tile + 1, data[room].bag.length);
  }

  return tiles;
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
        used: false,
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
  if (data[room]) {
    data[room].players = data[room].players.filter(
      item => item.name !== player,
    );
    if (data[room].players.length === 0) {
      console.log(`Room ${room} was deleted`.red);
      delete data[room];
    }
  }
};
const isWord = word => {
  const cleanedWord = word.trim().toLowerCase();
  return twl[cleanedWord];
};

const generateBag = letters => {
  let bagString = '';
  Object.keys(letters).forEach(letter => {
    for (let i = 0; i < letters[letter][1]; i += 1) {
      bagString += letter === 'BLANK' ? '*' : letter;
    }
  });
  return bagString;
};

const validateBoard = (s, board, player, room) => {
  if (data[room].ready.includes(player) || data[room].status !== 'playing') {
    socket.sendError(s, `You cannot submit at this time.`);
    return false;
  }

  const size = board.length;
  const center = Math.floor(size / 2);
  // check if center is filled
  if (board[center][center].letter === '') {
    socket.sendError(s, `You must start at the center!`);
    return false;
  }
  // make sure pieces are connected
  const connected = generateConnected(board, center, center, []);
  let rowToUse;
  let colToUse;

  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      if (board[row][col].temp) {
        if (connected.includes(row * size + col)) {
          rowToUse = row;
          colToUse = col;
          if (!checkInLine(board, row, col)) {
            socket.sendError(s, `Tiles must all be placed in a line.`);
            return false;
          }
        } else {
          socket.sendError(s, `All pieces must be connected.`);
          return false;
        }
      }
    }
  }

  if (rowToUse === undefined) {
    socket.sendError(s, `Place at least one tile.`);
    return false;
  }

  const [newBoard, words] = generateWords(board, rowToUse, colToUse, []);

  if (!newBoard) return false;

  // make sure pieces are together
  for (let row = 0; row < newBoard.length; row += 1) {
    for (let col = 0; col < newBoard.length; col += 1) {
      if (newBoard[row][col].temp) {
        socket.sendError(s, `Tiles must all be placed in a line.`);
        return false;
      }
      newBoard[row][col].used = true;
    }
  }

  if (words.length === 0) {
    socket.sendError(s, `Place more than one piece at the center.`);
    return false;
  }

  words.forEach(word => {
    console.log(`${player} played ${word.word} for ${word.points} points`.cyan);
    socket.sendGlobalAnnouncement(
      room,
      `${player} played ${word.word} for ${word.points} points`,
      'purple',
    );
    addToPlayerData(room, player, 'score', word.points);
    getPlayerData(room, player).words.push(word);
  });

  // A successful submission!
  // addToPlayerData(room, player, 'words', words);
  data[room].board = newBoard;
  data[room].ready.push(player);

  if (
    getPlayerData(room, player).letters.length === 0 &&
    data[room].bag.length > 0
  ) {
    socket.sendGlobalAnnouncement(
      room,
      `${player} got a BINGO! +50 points!`,
      'purple',
    );
    addToPlayerData(room, player, 'score', 50);
  }

  socket.sendUpdate(room, data[room]);
  return true;
};

const generateConnected = (board, row, col, visited) => {
  const id = (r, c) => r * board.length + c;

  if (visited.includes(id(row, col))) {
    return [];
  }
  if (row >= board.length || row < 0 || col >= board.length || col < 0) {
    return [];
  }
  if (board[row][col].letter === '') {
    return [];
  }
  return [id(row, col)].concat(
    generateConnected(board, row + 1, col, visited.concat(id(row, col))),
    generateConnected(board, row - 1, col, visited.concat(id(row, col))),
    generateConnected(board, row, col + 1, visited.concat(id(row, col))),
    generateConnected(board, row, col - 1, visited.concat(id(row, col))),
  );
};

const checkInLine = (board, row, col) => {
  let lock;
  for (let r = 0; r < board.length; r += 1) {
    if (board[r][col].temp && r !== row) lock = 'row';
  }
  for (let c = 0; c < board.length; c += 1) {
    if (board[row][c].temp && c !== col) {
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
    let pts = board[r][c].letter === '*' ? 0 : LETTERS[board[r][c].letter][0];
    if (board[r][c].used) {
      // console.log(`${board[r][c].letter} was worth ${pts} points USED`);
      return pts;
    }
    if (board[r][c].modifier === 'DW' || board[r][c].modifier === 'CENTER') {
      if (horiz) horizMult *= 2;
      else vertMult *= 2;
    } else if (board[r][c].modifier === 'TW') {
      if (horiz) horizMult *= 3;
      else vertMult *= 3;
    } else if (board[r][c].modifier === 'DL') pts *= 2;
    else if (board[r][c].modifier === 'TL') pts *= 3;
    // console.log(
    //   `${board[r][c].letter} was worth ${pts} points. ${board[r][c].modifier}`,
    // );
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

  // console.log(
  //   `${board[row][col].letter}, ${board[row + 1][col].letter}, ${
  //     board[row - 1][col].letter
  //   }, ${board[row][col + 1].letter}, ${board[row][col - 1].letter}`,
  // );
  // Traverse horizontally
  if (row < board.length - 1 && board[row + 1][col].letter !== '') {
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

  if (row > 0 && board[row - 1][col].letter !== '') {
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
  if (col < board.length - 1 && board[row][col + 1].letter !== '') {
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
  if (col > 0 && board[row][col - 1].letter !== '') {
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
  recursiveQueue.forEach(item => {
    processChild(item[0], item[1]);
  });

  if (!horizConflict && horizWord !== '')
    words.push({
      word: horizWord,
      points: horizScore * horizMult,
      challengable: true,
    });
  if (!vertConflict && vertWord !== '')
    words.push({
      word: vertWord,
      points: vertScore * vertMult,
      challengable: true,
    });

  return [newBoard, words];
};

const setReady = (room, player) => {
  if (!data[room].ready.includes(player)) {
    data[room].ready.push(player);
    socket.sendGlobalAnnouncement(room, `${player} is ready!`, 'green');
  }
};

const challenge = (room, you, them) => {
  const invalidWords = [];
  getPlayerData(room, them).words.map(word => {
    if (word.challengable) {
      const newWord = word;
      if (
        !word.word.includes('*') &&
        twl[word.word.toLowerCase()] === undefined
      ) {
        addToPlayerData(room, them, 'score', -word.points);
        socket.sendGlobalAnnouncement(
          room,
          `${word.word} is not a valid word!`,
          'blue',
        );
        newWord.points = 0;
        invalidWords.push(word);
      }
      newWord.challengable = false;
      return newWord;
    }
    return word;
  });
  if (invalidWords.length > 0) {
    socket.sendGlobalAnnouncement(room, `${them} loses a turn.`, 'blue');
    // for (let row = 0; row < data[room].board.length; row += 1) {
    //   for (let col = 0; col < data[room].board.length; col += 1) {
    //     if (
    //       data[room].board[row][col].challengable &&
    //       data[room].board[row][col].owner === you
    //     ) {
    //       data[room].board[row][col].challengable = false;
    //       data[room].board[row][col].owner = '';
    //       data[room].board[row][col].letter = '';
    //       setLetters(room, you, [
    //         ...getPlayerData(room, you).letters,
    //         data[room].board[row][col].letter,
    //       ]);
    //     }
    //   }
    // }
    setPlayerData(room, them, 'loseTurn', true);
    if (
      getPlayerData(room, them).letters.length === 0 &&
      data[room].bag.length > 0
    ) {
      addToPlayerData(room, them, 'score', -50);
    }
  } else {
    setPlayerData(room, you, 'loseTurn', true);
    socket.sendGlobalAnnouncement(
      room,
      `All words played by ${them} are valid! ${you} loses a turn.`,
      'blue',
    );
  }
  socket.sendUpdate(room, data[room]);
};

exports.joinRoom = joinRoom;
exports.getData = getData;
exports.setLetters = setLetters;
exports.setPlayerData = setPlayerData;
exports.getPlayerData = getPlayerData;
exports.setReady = setReady;
exports.deletePlayer = deletePlayer;
exports.isWord = isWord;
exports.validateBoard = validateBoard;
exports.startGame = startGame;
exports.challenge = challenge;
