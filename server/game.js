/* eslint-disable no-console */
const socket = require('./socket');

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
const setLetters = (room, player, letters) => {
  data[room].players.find(pl => pl.name === player).letters = letters;
};

exports.joinRoom = joinRoom;
exports.getData = getData;
exports.setLetters = setLetters;
exports.getPlayerData = getPlayerData;
