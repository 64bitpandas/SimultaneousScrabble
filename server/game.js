/* eslint-disable no-console */
const socket = require('./socket');
const twl = require('./data/twl.json');
const constants = require('./constants.js');

require('colors');

/**
 * The data object contains information about all currently active rooms.
 * roomname: string {
 *    status: waiting/playing/challenging,
 *    time: number (seconds),
 *    bag: string,
 *    ready: [string array],
 *    round: number,
 *    currPlaying?: number,
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
 *        isTurn: boolean,
 *        kick: [string array],
 *      }
 *    ],
 *   options: {
 *     boardSize: string,
 *     bagSize: string,
 *     playTime: number,
 *     challengeTime: number,
 *     simultaneous: boolean,
 *   }
 * }
 */
const data = {};

/**
 * Stores the game loop interval objects for each active room.
 * Destroy the interval when the game ends.
 */
const loops = {};

const createRoom = (s, player, room, options) => {
  // Convert options to their correct data types
  const cleanedOptions = Object.assign({}, options);
  cleanedOptions.playTime = parseInt(options.playTime, 10);
  cleanedOptions.challengeTime = parseInt(options.challengeTime, 10);
  cleanedOptions.simultaneous = options.simultaneous === 'true';

  // Create the default player template
  const defaultPlayer = {
    name: player,
    score: 0,
    words: [],
    letters: [],
    loseTurn: false,
    kick: [],
  };

  // Fill in starting data based on options
  data[room] = {
    board: generateBoard(
      constants.SIZE[options.boardSize],
      constants.SPECIALS[options.boardSize],
    ),
    players: [defaultPlayer],
    status: 'waiting',
    time: 0,
    bag: generateBag(constants.LETTERS[options.bagSize]),
    // bag: generateBag(constants.LETTERS.TEST),
    ready: [],
    round: 1,
    options: cleanedOptions,
  };
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

  if (data[room].status === 'waiting') {
    data[room].players.push(defaultPlayer);
  } else {
    socket.emit(s, 'serverSendJoinError', {
      error: 'Error: game already started',
    });
  }
  socket.sendUpdate(room, data[room]);
};

const startGame = room => {
  // Give each player new tiles
  for (let i = 0; i < data[room].players.length; i += 1) {
    const player = data[room].players[i];
    data[room].players[i].letters.push(...drawTiles(room, player));
  }

  // First round setup
  data[room].status = 'playing';
  data[room].time = data[room].options.playTime;
  data[room].ready = [];
  socket.serverLog(`The game in room ${room} has started!`.magenta);
  socket.sendGlobalAnnouncement(room, `Round 1 begins.`, 'blue');
  if (!data[room].options.simultaneous) {
    data[room].options.order = data[room].players.map(player => player.name);
    data[room].currPlaying = 0;
    socket.sendGlobalAnnouncement(
      room,
      `It's ${getCurrPlayer(room)}'s turn!`,
      'green',
    );
  }
  socket.sendUpdate(room, data[room]);
  // Begin game loop
  loops[room] = gameLoop(room);
};

const getCurrPlayer = room => data[room].options.order[data[room].currPlaying];

const gameLoop = room =>
  setInterval(() => {
    // If room was destroyed, stop the loop
    if (data[room] === undefined) {
      clearInterval(loops[room]);
      delete loops[room];
      return;
    }
    // Timer tick
    if (
      (data[room].status === 'playing' && data[room].options.playTime !== 0) ||
      (data[room].status === 'challenging' &&
        data[room].options.challengeTime !== 0)
    )
      data[room].time -= 1;
    // Currently in play phase
    if (
      (((data[room].status === 'playing' &&
        data[room].options.playTime !== 0) ||
        (data[room].status === 'challenging' &&
          data[room].options.challengeTime !== 0)) &&
        data[room].time === 0) ||
      data[room].ready.length === data[room].players.length ||
      (!data[room].options.simultaneous &&
        data[room].status === 'playing' &&
        data[room].ready.includes(getCurrPlayer(room)))
    ) {
      data[room].ready = [];
      if (data[room].status === 'playing') {
        if (!data[room].options.simultaneous) {
          data[room].currPlaying += 1;
        }

        // Switch to challenging phase
        if (
          data[room].options.simultaneous ||
          data[room].currPlaying >= data[room].players.length
        ) {
          data[room].status = 'challenging';
          data[room].currPlaying = 0;
          socket.globalEmit(room, 'serverSendChallengingTime');
          socket.sendGlobalAnnouncement(
            room,
            `Round ${data[room].round} has ended. Press ready to continue.`,
            'blue',
          );
          data[room].time = data[room].options.challengeTime;
          data[room].round += 1;
          data[room].players.forEach((player, index) => {
            data[room].players[index].loseTurn = false;
          });
          data[room].players.sort((a, b) => b.score - a.score);
        } else {
          socket.sendGlobalAnnouncement(
            room,
            `${
              data[room].options.order[data[room].currPlaying - 1]
            } has finished their turn! It's ${getCurrPlayer(room)}'s turn now.`,
            'green',
          );
          data[room].time = data[room].options.playTime;
        }
      } else if (data[room].status === 'challenging') {
        data[room].status = 'playing';
        let gameOverIndex = -1;
        for (let i = 0; i < data[room].players.length; i += 1) {
          const player = data[room].players[i];
          data[room].players[i].lastTurn = [];
          data[room].players[i].letters.push(...drawTiles(room, player));
          data[room].players[i].words.forEach((word, index) => {
            if (player.words[index].challengable) {
              data[room].players[i].words[index].challengable = false;
              if (twl[player.words[index].word.toLowerCase()] === undefined) {
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
          if (data[room].players[i].letters.length === 0) {
            gameOverIndex = i;
          }
        }

        data[room].players.sort((a, b) => b.score - a.score);
        // console.log(
        //   `Tiles remaining in ${room}: ${data[room].bag.length}`.blue,
        // );

        // Game over behavior
        if (gameOverIndex >= 0) {
          data[room].status = 'Game Over!';
          socket.sendGlobalAnnouncement(
            room,
            `Game over! ${data[room].players[0].name} wins with ${
              data[room].players[0].score
            } points!`,
          );

          socket.globalEmit(room, 'serverSendGameOver', {
            winners: data[room].players
              .filter(player => player.score === data[room].players[0].score)
              .map(player => player.name)
              .join(' and '),
            score: data[room].players[0].score,
            last: data[room].players[gameOverIndex].name,
          });
        } else {
          socket.sendGlobalAnnouncement(
            room,
            `Round ${data[room].round} begins. There are ${
              data[room].bag.length
            } tiles remaining.`,
            'blue',
          );
          data[room].time = data[room].options.playTime;
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

/**
 * Fills rack for PLAYER in ROOM, up to 7 tiles.
 * @returns {Array<string>} List of tiles
 */
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

/**
 * Creates a default, empty board based on specifications.
 * @param {string} size S, M, or L
 * @param {*} specials List of modifier tiles (see constants.js)
 * @returns The generated board
 */
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
      socket.serverLog(`Room ${room} was deleted`.red);
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

/**
 * Ensures that the board is valid when a submit request is made. If the board
 * is not valid, then send an error to the client.
 * @returns {boolean} True if board is in a valid state, false otherwise.
 */
const validateBoard = (s, board, player, room) => {
  // Not in playing phase
  if (data[room].ready.includes(player) || data[room].status !== 'playing') {
    socket.sendError(s, `You cannot submit at this time.`);
    return false;
  }

  // It's another player's turn right now
  if (!data[room].options.simultaneous && getCurrPlayer(room) !== player) {
    socket.sendError(s, `It's not your turn right now!`);
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
        if (board[row][col].letter === '*') {
          socket.sendError(
            s,
            `You must set blank tiles before playing them. Click on them when in the rack!`,
          );
          return false;
        }
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
    // console.log(`${player} played ${word.word} for ${word.points} points`.cyan);
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

/**
 * Returns a board containing only the tiles correctly connected to
 * the given row/col location.
 */
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

/**
 * Recursively evaluates a board containing temporary letters to calculate the
 * score of any new words that have been played in this turn.
 * @returns Array of [board, played words]
 */
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
    let pts = board[r][c].letter.includes('BLANK')
      ? 0
      : constants.LETTERS['75'][board[r][c].letter][0];
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
      horizWord += cleanLetter(board[r][col].letter);
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
      horizWord = cleanLetter(board[r][col].letter) + horizWord;
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
      vertWord += cleanLetter(board[row][c].letter);
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
      vertWord = cleanLetter(board[row][c].letter) + vertWord;
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

// Checks if words played by a player THEM were invalid
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

const cleanLetter = letter =>
  letter.includes('BLANK') ? letter.substring(6) : letter;

exports.joinRoom = joinRoom;
exports.createRoom = createRoom;
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
