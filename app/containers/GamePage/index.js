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
import { Connection } from '../../components/Connection';
import Gameboard from '../../components/Gameboard';
import Leaderboard from '../../components/Leaderboard';
import Loading from '../../components/Loading';
import Rack from '../../components/Rack';
import Topbar from '../../components/Topbar';
import '../../css/game.css';

/**
 * The main gameplay page. Takes a redirect from the landing page
 * (along with the information passed in, such as name and room)
 */
export default function GamePage(props) {
  if (props.location.state === undefined) {
    return <Redirect to="/" />;
  }

  // if (getError() !== '') {
  //   return (
  //     <Redirect
  //       to={{
  //         pathname: '/',
  //         state: {
  //           name: props.location.state.name,
  //           room: props.location.state.room,
  //           error: getError(),
  //         },
  //       }}
  //     />
  //   );
  // }
  return (
    <>
      <Connection
        name={props.location.state.name}
        room={props.location.state.room}
      />
      <Loading />
      <Topbar
        name={props.location.state.name}
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
          name={props.location.state.name}
          room={props.location.state.room}
        />
      </div>
    </>
  );
}
