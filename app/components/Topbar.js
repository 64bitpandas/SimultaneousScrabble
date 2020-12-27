import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import '../css/topbar.css';
import { beginConnection, quitGame } from './Connection';

export default class Topbar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      time: 0,
      room: props.room,
      name: props.name,
    };
  }

  render = () => (
    <div id="topbar">
      <h1>Simultaneous Scrabble</h1>
      <div id="timer">{this.formattedTime()}</div>
      <Link
        className="leave-btn"
        to={{
          pathname: '/',
          state: { name: this.state.name, room: this.state.room },
        }}
        onClick={quitGame}
      >
        Exit
      </Link>
    </div>
  );

  formattedTime = () => {
    const minutes = '' + (this.state.time % 60);
    let seconds = '' + Math.floor(this.state.time / 60);
    if (seconds < 10) {
      seconds = '0' + seconds;
    }
    return `${minutes}:${seconds}`;
  };

  startGame = () => {
    // emit('joinRoom', { name: this.state.name, room: this.state.room });
    beginConnection(this.state.room, this.state.name);
  };
}

Topbar.propTypes = {
  name: PropTypes.string,
  room: PropTypes.string,
};
