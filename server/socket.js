/* eslint-disable no-console */
const setupSocket = io => {
  io.on('connection', socket => {
    const { name, room } = socket.handshake.query;
    console.log(room);
    socket.join(room);
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
  });
};

exports.setupSocket = setupSocket;
