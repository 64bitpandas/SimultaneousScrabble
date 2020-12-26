import io from 'socket.io-client';
import { GLOBAL } from './GLOBAL';

let socket;
let chat;
let leaderboard;
let gameboard;

export function beginConnection(room, name) {
  socket = io.connect(GLOBAL.LOCALHOST, {
    query: `room=${room}&name=${name}`,
    reconnectionAttempts: 3,
    transports: ['websocket', 'polling', 'flashsocket'],
  });
  socket.on('connect', () => {
    // console.log('conncect');
  });
  socket.on('serverSendPlayerChat', data => {
    if (chat) {
      chat.addChatLine(data.sender, data.message, false);
    }
  });
  socket.on('serverSendLoginMessage', data => {
    if (chat) {
      chat.addLoginMessage(data.player, false);
    }
  });
  socket.on('serverSendUpdate', data => {
    if (leaderboard) {
      leaderboard.setState({ players: data.players });
    }
    if (gameboard) {
      gameboard.setState({ board: data.board });
    }
  });
}

export function emit(event, data) {
  socket.emit(event, data);
}

export function registerChat(c) {
  chat = c;
}
export function registerLeaderboard(board) {
  leaderboard = board;
}
export function registeGameboard(board) {
  gameboard = board;
}
