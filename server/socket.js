const {
  joinRoom,
  getData,
  setLetters,
  getPlayerData,
  deletePlayer,
  validateBoard,
  startGame,
  setReady,
} = require('./game');

const dictionary = require('./data/dictionary.json');

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
    socket.to(room).on('useLetter', data => {
      setLetters(room, data.name, data.letters);
      sendUpdateToPlayer(room);
    });
    socket.to(room).on('requestLetter', data => {
      setLetters(room, data.name, [
        ...getPlayerData(room, data.name).letters,
        data.letter,
      ]);
      sendUpdateToPlayer(room);
    });
    // socket.to(room).on('submit', data => {

    // });
    socket.on('requestDefinition', data => {
      const cleanedWord = data.word.trim().toLowerCase();
      if (dictionary[cleanedWord]) {
        socket.emit('serverSendAnnouncement', {
          msg: `The definition of ${cleanedWord.toUpperCase()} is: ${
            dictionary[cleanedWord]
          }`,
          color: 'purple',
        });
      } else {
        socket.emit('serverSendAnnouncement', {
          msg: `Sorry, no definition was found for ${cleanedWord.toUpperCase()}`,
          color: 'purple',
        });
      }
    });
    socket.on('submit', data => {
      validateBoard(data.board, name, room);
    });
    socket.on('startGame', () => {
      startGame(room);
    });
    socket.on('ready', () => {
      setReady(room, name);
    });
    socket.to(room).on('forceUpdate', () => {
      sendUpdateToPlayer(room);
    });
    socket.on('disconnect', () => {
      socket.to(room).broadcast.emit('serverSendAnnouncement', {
        msg: `${name} has left the game`,
        color: 'purple',
      });
      console.log(`${name} has left ${room}`.yellow);
      deletePlayer(name, room);
    });
  });
};

const sendUpdate = (room, data) => {
  io.in(room).emit('serverSendUpdate', data);
};

const sendUpdateToPlayer = room => {
  socket.emit('serverSendUpdate', getData(room));
};
const sendError = err => {
  socket.emit('serverSendAnnouncement', {
    msg: err,
    color: 'red',
  });
};
const sendAnnouncement = message => {
  socket.emit('serverSendAnnouncement', {
    msg: message,
    color: 'purple',
  });
};
const sendGlobalAnnouncement = (room, message, color) => {
  io.in(room).emit('serverSendAnnouncement', {
    msg: message,
    color,
  });
};

const emit = (event, data) => {
  socket.emit(event, data);
};

exports.emit = emit;
exports.setupSocket = setupSocket;
exports.sendUpdate = sendUpdate;
exports.sendError = sendError;
exports.sendAnnouncement = sendAnnouncement;
exports.sendGlobalAnnouncement = sendGlobalAnnouncement;
