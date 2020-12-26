import '../css/leaderboard.css';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { emit, registerLeaderboard } from './Connection';

export default class Leaderboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // name: props.name,
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
      </li>
    ));
    return (
      <div id="leaderboard">
        <h2>{this.state.room}</h2>
        <ol>{playerScores}</ol>
      </div>
    );
  };
}

Leaderboard.propTypes = {
  // name: PropTypes.string,
  room: PropTypes.string,
};
