/* eslint-disable react/prop-types */
/*
 * HomePage
 *
 * This is the first thing users see of our App, at the '/' route
 *
 */

import React from 'react';
// import { FormattedMessage } from 'react-intl';
// import messages from './messages';
import ChatClient from '../../components/ChatClient';

export default function GamePage(props) {
  return (
    <ChatClient
      player={props.location.state.name}
      room={props.location.state.room}
    />
  );
}
