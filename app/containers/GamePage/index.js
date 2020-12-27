/* eslint-disable react/prop-types */
/*
 * HomePage
 *
 * This is the first thing users see of our App, at the '/' route
 *
 */

import React from 'react';
import { Redirect } from 'react-router-dom';
// import { FormattedMessage } from 'react-intl';
// import messages from './messages';
import ChatClient from '../../components/ChatClient';
import Gameboard from '../../components/Gameboard';
import Leaderboard from '../../components/Leaderboard';
import Rack from '../../components/Rack';
import Topbar from '../../components/Topbar';
import '../../css/game.css';

export default function GamePage(props) {
  if (props.location.state === undefined) {
    return <Redirect to="/" />;
  }
  return (
    <>
      <Topbar
        player={props.location.state.name}
        room={props.location.state.room}
      />
      <div id="game">
        <Gameboard name={props.location.state.name} />
        <ChatClient
          player={props.location.state.name}
          room={props.location.state.room}
        />
        <Rack name={props.location.state.name} />
        <Leaderboard
          player={props.location.state.name}
          room={props.location.state.room}
        />
      </div>
    </>
  );
}
