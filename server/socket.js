const game = require('./game');

// const dictionary = require('./data/dictionary.json');

/* eslint-disable no-console */

let io;

const setupSocket = i => {
  i.on('connection', s => {
    io = i;
    const { name, room } = s.handshake.query;
    if (
      game.getData(room) !== undefined &&
      game.getData(room).status !== 'waiting'
    ) {
      s.emit('serverSendJoinError', { error: 'Game in progress' });
      return;
    }
    s.join(room);
    game.joinRoom(s, name, room);
    console.log('[Server] '.bold.blue + `${name} connected to ${room}`.green);
    s.to(room).broadcast.emit('serverSendLoginMessage', { player: name });
    s.to(room).on('playerChat', data => {
      const sender = data.sender.replace(/(<([^>]+)>)/gi, '');
      const message = data.message.replace(/(<([^>]+)>)/gi, '');

      console.log(
        '[CHAT] '.bold.blue +
          `${new Date().getHours()}:${new Date().getMinutes()} ${sender}: ${message}`
            .magenta,
      );

      s.to(room).broadcast.emit('serverSendPlayerChat', {
        sender,
        message: message.substring(0, 35),
      });
    });
    s.to(room).on('useLetter', data => {
      game.setLetters(room, data.name, data.letters);
      sendUpdateToPlayer(s, room);
    });
    s.to(room).on('requestLetter', data => {
      game.setLetters(room, data.name, [
        ...game.getPlayerData(room, data.name).letters,
        data.letter,
      ]);
      sendUpdateToPlayer(s, room);
    });

    s.to(room).on('shuffleLetters', data => {
      game.setLetters(room, data.player, data.letters);
      sendUpdateToPlayer(s, room);
    });

    s.to(room).on('setBlank', data => {
      console.log('setblank');
      const letters = [...game.getPlayerData(room, data.player).letters];
      letters[data.index] = 'BLANK_' + data.letter.toUpperCase();
      game.setLetters(room, data.player, letters);
      sendUpdate(s, room);
    });

    // s.to(room).on('submit', data => {

    // });
    // s.on('requestDefinition', data => {
    //   const cleanedWord = data.word.trim().toLowerCase();
    //   if (dictionary[cleanedWord]) {
    //     sendAnnouncement(
    //       s,
    //       `The definition of ${cleanedWord.toUpperCase()} is: ${
    //         dictionary[cleanedWord]
    //       }`,
    //     );
    //   } else {
    //     sendAnnouncement(
    //       s,
    //       `Sorry, no definition was found for ${cleanedWord.toUpperCase()}`,
    //     );
    //   }
    // });
    s.on('submit', data => {
      game.validateBoard(s, data.board, name, room);
    });
    s.on('startGame', () => {
      if (game.getData(room).status !== 'waiting') {
        sendError(s, 'Game has already started!');
      } else {
        game.startGame(room);
      }
    });
    s.on('ready', () => {
      game.setReady(room, name);
    });
    s.on('challenge', data => {
      if (game.getData(room).status === 'challenging') {
        console.log(data.you);
        if (data.you !== data.them) {
          sendGlobalAnnouncement(
            room,
            `${data.you} has challenged ${data.them}!`,
            'blue',
          );
          game.challenge(room, data.you, data.them);
        } else {
          sendError(s, 'You cannot challenge yourself!');
        }
      } else {
        sendError(s, 'You cannot challenge at this time.');
      }
    });

    s.to(room).on('votekick', data => {
      if (data.you !== data.them) {
        const playersNeeded = game.getData(room).players.length - 1;
        if (!game.getPlayerData(room, data.them).kick.includes(data.you)) {
          game.setPlayerData(
            room,
            data.them,
            'kick',
            game.getPlayerData(room, data.them).kick.concat([data.you]),
          );
        }
        sendGlobalAnnouncement(
          room,
          `${data.you} votes to kick ${data.them}! (${
            game.getPlayerData(room, data.them).kick.length
          }/${playersNeeded})`,
        );
        sendUpdate(room, game.getData(room));
      } else {
        sendError(s, 'You cannot kick yourself.');
      }
    });

    s.to(room).on('forceUpdate', () => {
      sendUpdateToPlayer(s, room);
    });
    s.on('disconnect', () => {
      s.to(room).broadcast.emit('serverSendAnnouncement', {
        msg: `${name} has left the game`,
        color: 'red',
      });
      console.log(`${name} has left ${room}`.yellow);
      game.deletePlayer(room, name);
    });
  });
};

const sendUpdate = (room, data) => {
  io.in(room).emit('serverSendUpdate', data);
};

const sendUpdateToPlayer = (socket, room) => {
  socket.emit('serverSendUpdate', game.getData(room));
};
const sendError = (socket, err) => {
  socket.emit('serverSendAnnouncement', {
    msg: err,
    color: 'red',
  });
};
const sendAnnouncement = (socket, message) => {
  socket.emit('serverSendAnnouncement', {
    msg: message,
    color: 'purple',
  });
};
const sendGlobalAnnouncement = (room, message, color) => {
  globalEmit(room, 'serverSendAnnouncement', {
    msg: message,
    color,
  });
};

const emit = (socket, event, data) => {
  socket.emit(event, data);
};

const globalEmit = (room, event, data) => {
  io.in(room).emit(event, data);
};

exports.emit = emit;
exports.setupSocket = setupSocket;
exports.sendUpdate = sendUpdate;
exports.sendError = sendError;
exports.sendAnnouncement = sendAnnouncement;
exports.sendGlobalAnnouncement = sendGlobalAnnouncement;
exports.globalEmit = globalEmit;
