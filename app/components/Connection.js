import io from 'socket.io-client';
import { GLOBAL } from './GLOBAL';

let socket;

export function beginConnection(room, name) {
  socket = io.connect(GLOBAL.LOCALHOST, {
    query: `room=${room}&name=${name}`,
    reconnectionAttempts: 3,
    transports: ['websocket', 'polling', 'flashsocket'],
  });
  socket.on('connect', () => {
    // console.log('conncect');
  });
}

export function emit(event, data) {
  socket.emit(event, data);
}
