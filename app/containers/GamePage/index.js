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
import Leaderboard from '../../components/Leaderboard';

export default function GamePage(props) {
  if (props.location.state === undefined) {
    return <Redirect to="/" />;
  }
  return (
    <div>
      <ChatClient
        player={props.location.state.name}
        room={props.location.state.room}
      />
      <Leaderboard
        player={props.location.state.name}
        room={props.location.state.room}
      />
    </div>
  );
}
