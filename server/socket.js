const { joinRoom, getData } = require('./game');

/* eslint-disable no-console */

let socket;
let io;

const setupSocket = i => {
  i.on('connection', s => {
    socket = s;
    io = i;
    const { name, room } = socket.handshake.query;
    console.log(room);
    socket.join(room);
    joinRoom(name, room);
    console.log('[Server] '.bold.blue + `${name} connected to ${room}`.green);
    socket.to(room).broadcast.emit('serverSendLoginMessage', { player: name });
    socket.to(room).on('playerChat', data => {
      const sender = data.sender.replace(/(<([^>]+)>)/gi, '');
      const message = data.message.replace(/(<([^>]+)>)/gi, '');

      console.log(
        '[CHAT] '.bold.blue +
          `${new Date().getHours()}:${new Date().getMinutes()} ${sender}: ${message}`
            .magenta,
      );

      socket.to(room).broadcast.emit('serverSendPlayerChat', {
        sender,
        message: message.substring(0, 35),
      });
    });
    socket.to(room).on('forceUpdate', () => {
      sendUpdate(room, getData(room));
    });
  });
};

const sendUpdate = (room, data) => {
  io.in(room).emit('serverSendUpdate', data);
};

exports.setupSocket = setupSocket;
exports.sendUpdate = sendUpdate;
