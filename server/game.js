/* eslint-disable no-console */
const socket = require('./socket');

require('colors');

/**
 * The data object contains information about all currently active rooms.
 * roomname: string {
 *    board: [[
 *      {
 *        letter?: string,
 *        modifier?: string,
 *        owner?: string,
 *      }
 *    ]]
 *    players: [
 *      {
 *        name: string,
 *        score: number,
 *        words: [string array]
 *      }
 *    ]
 * }
 */
const data = {};

const SIZE = 15;
const SPECIALS = {
  TW: [[0, 0], [0, 7], [0, 14], [7, 0], [7, 7], [7, 14]],
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
    [7, 3],
    [8, 4],
    [9, 3],
    [3, 7],
    [4, 8],
    [7, 3],
    [12, 7],
    [11, 8],
    [12, 9],
    [7, 12],
    [8, 11],
    [9, 12],
  ],
};

const joinRoom = (player, room) => {
  if (!data[room]) {
    data[room] = {
      board: generateBoard(SIZE, SPECIALS),
      players: [
        {
          name: player,
          score: 0,
          words: [],
        },
      ],
    };
    console.log(`New room created: ${room}`.cyan);
  } else {
    data[room].players.push({
      name: player,
      score: 0,
      words: [],
    });
  }
  socket.sendUpdate(room, data[room]);
};

const generateBoard = (size, specials) => {
  const board = [];
  for (let row = 0; row < size; row += 1) {
    board.push([]);
    for (let col = 0; col < size; col += 1) {
      board[row].push({ letter: '', modifier: '', owner: '' });
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

exports.joinRoom = joinRoom;
exports.getData = getData;
