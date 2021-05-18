import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import '../css/menu.css';
import PropTypes from 'prop-types';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import ReactTooltip from 'react-tooltip';
import 'react-tabs/style/react-tabs.css';
import swal from 'sweetalert';
import logo from '../images/SS_Logo_Extended.png';

import { beginConnection, registerMainPanel, setError } from './Connection';
import { GLOBAL } from './GLOBAL';

/**
 * The main menu lobby where players enter room information/configuration to set up a game.
 */
export default class MainPanel extends Component {
  static propTypes = {
    name: PropTypes.string,
    room: PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.state = {
      name: props.name,
      room: props.room,
      server: '',
      options: {
        boardSize: 'M',
        bagSize: 100,
        playTime: 90,
        challengeTime: 30,
        simultaneous: true,
        endingBehavior: 'extraRound',
      },
    };
    registerMainPanel(this);
  }

  render = () => (
    <div id="main-panel">
      <img src={logo} alt="SimultaneousScrabble Logo" className="logo" />
      <Tabs>
        <TabList>
          <Tab>Join a Game</Tab>
          <Tab>Create a Room</Tab>
        </TabList>

        <TabPanel>
          <h1>Join a Game</h1>
          <div className="field">
            <span className="label">
              <span>Name</span>
            </span>
            <input
              type="text"
              id="name"
              placeholder="Enter Username"
              autoComplete="off"
              value={this.state.name}
              onChange={txt => {
                this.setState({
                  name: txt.target.value,
                });
              }}
              onKeyDown={event => {
                if (
                  event.key !== 'Backspace' &&
                  event.key !== 'Delete' &&
                  event.target.value.length > GLOBAL.MAX_NAME_LENGTH
                )
                  event.preventDefault();
              }}
            />
          </div>
          <div className="field">
            <span className="label">
              <span>Room</span>
            </span>
            <input
              type="text"
              id="room"
              placeholder="Enter Room Name"
              autoComplete="off"
              value={this.state.room}
              onChange={txt => {
                this.setState({
                  room: txt.target.value,
                });
              }}
            />
          </div>
          <div className="field">
            <span className="label">
              <span>Server</span>
            </span>
            <input
              type="text"
              id="server"
              placeholder="Leave Blank for Default"
              onChange={txt => {
                this.setState({
                  server: txt.target.value,
                });
              }}
            />
          </div>
          <Link
            to={{
              pathname: '/game',
              state: {
                name: this.state.name,
                room: this.state.room,
              },
            }}
            id="startButton"
            className="button btn-primary"
            onClick={() => this.startGame(false)}
          >
            Play
          </Link>
          <button
            className="button btn-about"
            type="button"
            onClick={() => {
              swal('About SimultaneousScrabble', GLOBAL.INFO, 'info');
            }}
          >
            About
          </button>
        </TabPanel>
        <TabPanel>
          <h1>Create a Room</h1>
          <div className="field">
            <span className="label">
              <span>Name</span>
            </span>
            <input
              type="text"
              id="name"
              placeholder="Enter Username"
              autoComplete="off"
              value={this.state.name}
              onChange={txt => {
                this.setState({
                  name: txt.target.value,
                });
              }}
              onKeyDown={event => {
                if (
                  event.key !== 'Backspace' &&
                  event.key !== 'Delete' &&
                  event.target.value.length > GLOBAL.MAX_NAME_LENGTH
                )
                  event.preventDefault();
              }}
            />
          </div>
          <div className="field">
            <span className="label">
              <span>Room</span>
            </span>
            <input
              type="text"
              id="room"
              placeholder="Enter Room Name"
              autoComplete="off"
              value={this.state.room}
              onChange={txt => {
                this.setState({
                  room: txt.target.value,
                });
              }}
            />
          </div>
          <div className="field">
            <span className="label">
              <span>Server</span>
            </span>
            <input
              type="text"
              id="server"
              placeholder="Leave Blank for Default"
              onChange={txt => {
                this.setState({
                  server: txt.target.value,
                });
              }}
            />
          </div>
          <h2>Options</h2>
          <ReactTooltip place="top" type="dark" effect="float" html />
          <div className="field">
            <span
              className="label option-label"
              data-tip="Choose Turn-Based for a slower, but more traditional game of Scrabble. <br /> Simultaneous strongly recommended for >4 players."
            >
              <span>Play Style</span>
            </span>
            {/* <input
              type="text"
              id="server"
              placeholder="Leave Blank for Default"
              onChange={txt => {
                this.setState({
                  server: txt.target.value,
                });
              }}
            /> */}
            <button
              type="button"
              className={
                'field-btn ' +
                (this.state.options.simultaneous ? 'red-btn' : '')
              }
              onClick={() => {
                this.setOption('simultaneous', true);
              }}
            >
              Simultaneous
            </button>
            <button
              type="button"
              className={
                'field-btn ' +
                (this.state.options.simultaneous ? '' : 'blue-btn')
              }
              onClick={() => {
                this.setOption('simultaneous', false);
              }}
            >
              Turn-Based
            </button>
          </div>

          <div className="field">
            <span
              className="label option-label"
              data-tip="Small: 11x11 <br/> Standard: 15x15 (normal Scrabble board) <br/> Large: 19x19"
            >
              <span>Board Size</span>
            </span>
            <button
              type="button"
              className={
                'field-btn ' +
                (this.state.options.boardSize === 'S' ? 'blue-btn' : '')
              }
              onClick={() => {
                this.setOption('boardSize', 'S');
              }}
            >
              Small
            </button>
            <button
              type="button"
              className={
                'field-btn ' +
                (this.state.options.boardSize === 'M' ? 'yellow-btn' : '')
              }
              onClick={() => {
                this.setOption('boardSize', 'M');
              }}
            >
              Standard
            </button>
            <button
              type="button"
              className={
                'field-btn ' +
                (this.state.options.boardSize === 'L' ? 'red-btn' : '')
              }
              onClick={() => {
                this.setOption('boardSize', 'L');
              }}
            >
              Large
            </button>
          </div>
          <div className="field">
            <span
              className="label option-label"
              data-tip="Number of tiles in bag. Game ends when tiles run out."
            >
              <span>Number of Tiles</span>
            </span>
            <button
              type="button"
              className={
                'field-btn ' +
                (this.state.options.bagSize === 75 ? 'blue-btn' : '')
              }
              onClick={() => {
                this.setOption('bagSize', 75);
              }}
            >
              75
            </button>
            <button
              type="button"
              className={
                'field-btn ' +
                (this.state.options.bagSize === 100 ? 'yellow-btn' : '')
              }
              onClick={() => {
                this.setOption('bagSize', 100);
              }}
            >
              100
            </button>
            <button
              type="button"
              className={
                'field-btn ' +
                (this.state.options.bagSize === 150 ? 'red-btn' : '')
              }
              onClick={() => {
                this.setOption('bagSize', 150);
              }}
            >
              150
            </button>
          </div>
          <div className="field">
            <span
              className="label option-label"
              data-tip="Time (in seconds) before each round ends. Set to 0 to disable timer."
            >
              <span>Round Time</span>
            </span>
            <input
              type="text"
              className="option-input"
              placeholder="Enter a non-negative number"
              onChange={txt => {
                this.setOption('playTime', txt.target.value);
              }}
              value={this.state.options.playTime}
            />
          </div>
          <div className="field">
            <span
              className="label option-label"
              data-tip="Time (in seconds) between rounds. Set to 0 to disable timer."
            >
              <span>Challenge Time</span>
            </span>
            <input
              type="text"
              className="option-input"
              placeholder="Enter a non-negative number"
              onChange={txt => {
                this.setOption('challengeTime', txt.target.value);
              }}
              value={this.state.options.challengeTime}
            />
          </div>
          <Link
            to={{
              pathname: '/game',
              state: {
                name: this.state.name,
                room: this.state.room,
              },
            }}
            id="createButton"
            className="button btn-create"
            onClick={() => this.startGame(true)}
          >
            Create Room
          </Link>
        </TabPanel>
      </Tabs>
    </div>
  );

  setOption = (option, value) => {
    this.setState(oldState => ({
      options: {
        ...oldState.options,
        [option]: value,
      },
    }));
  };

  startGame = creating => {
    // emit('joinRoom', { name: this.state.name, room: this.state.room });
    if (this.state.name === '') {
      setError('Please enter a name.');
    } else if (this.state.room === '') {
      setError('Please enter a room name.');
    } else {
      beginConnection(
        this.state.room,
        this.state.name,
        this.state.server,
        this.state.options,
        creating,
      );
    }
  };
}
