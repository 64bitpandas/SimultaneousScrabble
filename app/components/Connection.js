import io from 'socket.io-client';
import { GLOBAL } from './GLOBAL';

let socket;
let chat;
let leaderboard;
let gameboard;
let rack;
let mainpanel;
let topbar;

export function beginConnection(room, name, server) {
  socket = io.connect(server === '' ? GLOBAL.LOCALHOST : server, {
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
  socket.on('serverSendAnnouncement', data => {
    chat.appendMessage(data.msg, data.color);
  });
  socket.on('serverSendUpdate', data => {
    if (leaderboard) {
      leaderboard.setState({ players: data.players });
    }
    if (gameboard) {
      gameboard.updateBoard(data.board);
      gameboard.setState({
        canPlace:
          data.status === 'playing' &&
          !data.players.filter(player => player.name === name)[0].loseTurn,
      });
    }
    if (rack) {
      rack.setState({
        letters: data.players.filter(player => player.name === name)[0].letters,
      });
    }
    if (topbar) {
      topbar.setState({
        time: data.time,
      });
    }
  });
  socket.on('serverSendJoinError', data => {
    if (mainpanel) {
      mainpanel.setState({ error: data.error });
    }
  });
  socket.on('serverSendChallengingTime', () => {
    if (gameboard) {
      gameboard.tempRemoveAll();
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
export function registerGameboard(board) {
  gameboard = board;
}
export function registerRack(thisRack) {
  rack = thisRack;
}
export function registerMainPanel(thisMainPanel) {
  mainpanel = thisMainPanel;
}
export function registerTopbar(thisTopbar) {
  topbar = thisTopbar;
}
export function getGameboard() {
  return gameboard;
}
export function submit() {
  socket.emit('submit', {
    board: gameboard.state.board,
  });
}
export function quitGame() {
  chat.appendMessage(`${chat.state.player} has left the game`, 'purple');
  socket.disconnect();
}
