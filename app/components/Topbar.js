import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import '../css/topbar.css';
import logo from '../images/SS_Logo_Extended.png';
import { emit, quitGame, registerTopbar, setError } from './Connection';

export default class Topbar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      time: 0,
      room: props.room,
      name: props.name,
      status: '',
    };
    registerTopbar(this);
  }

  render = () => (
    <div id="topbar" className={this.state.status}>
      <span
        className={this.state.status + ' progress'}
        style={{ width: '' + this.getTimeRatio() * 100 + '%' }}
      />
      <img src={logo} alt="SimultaneousScrabble Logo" id="logo-img" />
      <div
        id="timer"
        className={this.state.time <= 15 && this.state.time > 0 ? 'low' : ''}
      >
        {this.formattedTime()} · {this.state.status}
      </div>
      {this.state.status === 'waiting' && (
        <button
          className="topbar-btn start-btn"
          onClick={this.startGame}
          type="button"
        >
          Start Game
        </button>
      )}
      <Link
        className="topbar-btn leave-btn"
        to={{
          pathname: '/',
          state: { name: this.state.name, room: this.state.room },
        }}
        onClick={() => {
          setError('You have left the game.');
          quitGame();
        }}
      >
        Exit
      </Link>
    </div>
  );

  formattedTime = () => {
    let seconds = '' + (this.state.time % 60);
    const minutes = '' + Math.floor(this.state.time / 60);
    if (seconds < 10) {
      seconds = '0' + seconds;
    }
    return `${minutes}:${seconds}`;
  };

  startGame = () => {
    // emit('joinRoom', { name: this.state.name, room: this.state.room });
    emit('startGame', { room: this.state.room });
  };

  getTimeRatio = () => {
    if (this.state.status === 'playing') {
      return this.state.time / 90;
    }
    if (this.state.status === 'challenging') {
      return this.state.time / 30;
    }
    return 0;
  };
}

Topbar.propTypes = {
  name: PropTypes.string,
  room: PropTypes.string,
};
