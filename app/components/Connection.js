import io from 'socket.io-client';
import { GLOBAL } from './GLOBAL';

let socket;
let chat;

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
}

export function emit(event, data) {
  socket.emit(event, data);
}

export function registerChat(c) {
  chat = c;
}
