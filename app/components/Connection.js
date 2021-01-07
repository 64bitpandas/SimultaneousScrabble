import React, { useState } from 'react';
import { Redirect } from 'react-router-dom';
import io from 'socket.io-client';
import PropTypes from 'prop-types';
import swal from 'sweetalert';
import { GLOBAL } from './GLOBAL';

let socket;
let chat;
let leaderboard;
let gameboard;
let rack;
let mainpanel;
let topbar;
let currLetter = '';
let dropped = false;
let errorCache = '';
let connected = false;
let setErrorFunc;

export const Connection = ({ name, room }) => {
  const [error, setErr] = useState(errorCache);
  setErrorFunc = setErr;

  if (error !== '') {
    setErrorFunc = undefined;
    errorCache = '';
    return (
      <Redirect
        to={{
          pathname: '/',
          state: {
            name,
            room,
            error,
          },
        }}
      />
    );
  }

  return <span style={{ display: 'none' }} />;
};

Connection.propTypes = {
  name: PropTypes.string,
  room: PropTypes.string,
};

export function beginConnection(room, name, server, options, creating) {
  connected = false;
  let query = `room=${room}&name=${name}&creating=${creating}`;
  Object.keys(options).forEach(option => {
    query += `&${option}=${options[option]}`;
  });
  socket = io.connect(server === '' ? GLOBAL.LOCALHOST : server, {
    query,
    reconnectionAttempts: 1,
    transports: ['websocket', 'polling', 'flashsocket'],
  });
  setTimeout(() => {
    if (!connected) {
      setError('Unable to connect to server');
    }
  }, GLOBAL.TIMEOUT);
  socket.on('connect', () => {
    connected = true;
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
        options: data.options,
        size: GLOBAL.SIZE[data.options.boardSize],
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
        status: data.status,
        playTime: data.options.playTime,
        challengeTime: data.options.challengeTime,
      });
    }
    if (
      data.players.filter(player => player.name === name)[0].kick.length >=
        data.players.length - 1 &&
      data.players.length > 1
    ) {
      quitGame();
      setError('You have been kicked');
    }
  });
  socket.on('serverSendJoinError', data => {
    if (mainpanel) {
      mainpanel.setState({ error: data.error });
    }
    setError(data.error);
  });
  socket.on('serverSendChallengingTime', () => {
    if (gameboard) {
      gameboard.tempRemoveAll();
    }
  });
  socket.on('serverSendGameOver', data => {
    swal(
      'Game Over!',
      `${data.last} used all of their tiles, so ${
        data.winners
      } won the game with ${data.score} points!`,
      'success',
    );
  });
}

export function emit(event, data) {
  if (socket !== undefined) socket.emit(event, data);
  // else error = 'Could not connect to server';
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
  connected = false;
  errorCache = '';
  setErrorFunc('');
  setErrorFunc = undefined;
  socket.disconnect();
}
export function getCurrLetter() {
  return currLetter;
}
export function setCurrLetter(newLetter) {
  currLetter = newLetter;
}
export function setDropped(drop) {
  dropped = drop;
}
export function getDropped() {
  return dropped;
}
export function setError(err) {
  if (setErrorFunc !== undefined) {
    setErrorFunc(err);
  } else {
    errorCache = err;
  }
}
