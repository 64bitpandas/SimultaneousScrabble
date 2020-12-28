import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import '../css/menu.css';
import { beginConnection, registerMainPanel } from './Connection';

export default class MainPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      room: '',
      error: '',
    };
    registerMainPanel(this);
  }

  render = () => (
    <div id="main-panel">
      <h1>Simultaneous Scrabble</h1>
      <h2>Join a Game</h2>
      <input
        className="menuInputBox box"
        type="text"
        tabIndex="0"
        placeholder="Enter your name here"
        id="name"
        spellCheck="false"
        onChange={txt => {
          this.setState({ name: txt.target.value });
        }}
      />
      <input
        className="menuInputBox box"
        type="text"
        tabIndex="0"
        placeholder="Enter room name here"
        id="room"
        spellCheck="false"
        onChange={txt => {
          this.setState({ room: txt.target.value });
        }}
      />
      <Link
        to={{
          pathname: '/game',
          state: { name: this.state.name, room: this.state.room },
        }}
        id="startButton"
        className="button btn-primary"
        onClick={this.startGame}
      >
        Play
      </Link>
      <div id="err-msg">{this.state.error}</div>
    </div>
  );

  startGame = () => {
    // emit('joinRoom', { name: this.state.name, room: this.state.room });
    beginConnection(this.state.room, this.state.name);
  };
}
