import '../css/leaderboard.css';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { emit, registerLeaderboard } from './Connection';

/**
 * Leaderboard widget that displays scores for all players in the room.
 */
export default class Leaderboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: props.name,
      room: props.room,
      players: [],
    };
    registerLeaderboard(this);
    emit('forceUpdate', {});
  }

  render = () => {
    const playerScores = this.state.players.map(player => (
      <li key={player.name}>
        {player.name}: {player.score}
        <button
          type="button"
          className="challenge-btn"
          onClick={() => {
            this.challenge(player.name);
          }}
        >
          Challenge
        </button>
        <button
          type="button"
          className="challenge-btn"
          onClick={() => {
            this.kick(player.name);
          }}
        >
          Kick
        </button>
      </li>
    ));
    return (
      <div id="leaderboard">
        <h2>{this.state.room}</h2>
        <ol>{playerScores}</ol>
      </div>
    );
  };

  challenge = playerToChallenge => {
    emit('challenge', {
      you: this.state.name,
      them: playerToChallenge,
    });
  };

  kick = playerToKick => {
    emit('votekick', {
      you: this.state.name,
      them: playerToKick,
    });
  };
}

Leaderboard.propTypes = {
  name: PropTypes.string,
  room: PropTypes.string,
};
