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
import MainPanel from '../../components/MainPanel';

export default function HomePage(props) {
  if (props.location.state === undefined) {
    return (
      <div id="container">
        <MainPanel />
      </div>
    );
  }
  return (
    <div id="container">
      <MainPanel
        name={props.location.state.name}
        room={props.location.state.room}
      />
    </div>
  );
}
