import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import '../css/topbar.css';
import logo from '../images/SS_Logo_Extended.png';
import { emit, quitGame, registerTopbar, setError } from './Connection';

/**
 * The in-game topbar containing current phase, menu buttons, and timer.
 */
export default class Topbar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      time: 0,
      room: props.room,
      name: props.name,
      status: '',
      currPlaying: '',
      simultaneous: true,
      playTime: 90,
      challengeTime: 30,
    };
    registerTopbar(this);
  }

  render = () => (
    <div id="topbar" className={this.state.status + this.getNotTurn()}>
      <span
        className={this.state.status + ' progress' + this.getNotTurn()}
        style={{ width: '' + this.getTimeRatio() * 100 + '%' }}
      />
      <img src={logo} alt="SimultaneousScrabble Logo" id="logo-img" />
      <div
        id="timer"
        className={this.state.time <= 15 && this.state.time > 0 ? 'low' : ''}
      >
        {this.formattedTime()} ·{' '}
        {!this.state.simultaneous &&
        this.state.currPlaying !== this.state.name &&
        this.state.status === 'playing'
          ? `${this.state.currPlaying}'s turn`
          : this.state.status}
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

  /**
   * Takes in the current time (in seconds) and returns a human-readable time for the timer.
   * @returns {string} A time string in the format MM:SS
   */
  formattedTime = () => {
    let seconds = '' + (this.state.time % 60);
    const minutes = '' + Math.floor(this.state.time / 60);
    if (seconds < 10) {
      seconds = '0' + seconds;
    }
    return `${minutes}:${seconds}`;
  };

  /**
   * Sends a startGame signal to the server.
   */
  startGame = () => {
    // emit('joinRoom', { name: this.state.name, room: this.state.room });
    emit('startGame', { room: this.state.room });
  };

  /**
   * Calculates the proportion of time remaining in the current phase (for the topbar effect).
   * @returns {number} Proportion of time remaining in this phase
   */
  getTimeRatio = () => {
    if (this.state.status === 'playing') {
      return this.state.playTime === 0
        ? 0
        : this.state.time / this.state.playTime;
    }
    if (this.state.status === 'challenging') {
      return this.state.challengeTime === 0
        ? 0
        : this.state.time / this.state.challengeTime;
    }
    return 0;
  };

  /**
   * Used to append ' notyourturn' to the end of the current status if the current player cannot go yet.
   * @returns {string} ' notyourturn' or '' depending on the current state
   */
  getNotTurn = () =>
    !this.state.simultaneous &&
    this.state.currPlaying !== this.state.name &&
    this.state.status === 'playing'
      ? ' notyourturn'
      : '';
}

Topbar.propTypes = {
  name: PropTypes.string,
  room: PropTypes.string,
};
