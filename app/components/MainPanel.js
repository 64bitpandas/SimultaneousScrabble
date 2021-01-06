import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import '../css/menu.css';
import PropTypes from 'prop-types';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import 'react-tabs/style/react-tabs.css';
import logo from '../images/SS_Logo_Extended.png';

import { beginConnection, registerMainPanel, setError } from './Connection';
import { GLOBAL } from './GLOBAL';

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
            onClick={this.startGame}
          >
            Play
          </Link>
        </TabPanel>
        <TabPanel>
          <h2>Coming Soon!</h2>
        </TabPanel>
      </Tabs>

      {/* <input
        className="menuInputBox box"
        type="text"
        tabIndex="0"
        placeholder="Enter room name here"
        id="room"
        spellCheck="false"
        onChange={txt => {
          this.setState({
            room: txt.target.value,
          });
        }}
      />
      <input
        className="menuInputBox box"
        type="text"
        tabIndex="0"
        placeholder="Enter server (optional)"
        id="server"
        spellCheck="false"
        onChange={txt => {
          this.setState({
            server: txt.target.value,
          });
        }}
      /> */}

      {/* <div id="err-msg">{this.state.error}</div> */}
    </div>
  );

  startGame = () => {
    console.log(this.state);
    // emit('joinRoom', { name: this.state.name, room: this.state.room });
    if (this.state.name === '') {
      setError('Please enter a name.');
    } else if (this.state.room === '') {
      setError('Please enter a room name.');
    } else {
      beginConnection(this.state.room, this.state.name, this.state.server);
    }
  };
}
