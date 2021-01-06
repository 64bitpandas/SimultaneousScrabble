/* eslint-disable react/prop-types */
/*
 * HomePage
 *
 * This is the first thing users see of our App, at the '/' route
 *
 */

import React from 'react';
import swal from 'sweetalert';
import { setError } from '../../components/Connection';
// import { FormattedMessage } from 'react-intl';
// import messages from './messages';
import MainPanel from '../../components/MainPanel';

export default function HomePage(props) {
  if (props.location.state === undefined) {
    return (
      <div id="container">
        <MainPanel name="" room="" />
      </div>
    );
  }
  if (props.location.state.error) {
    swal('Error Joining Server', props.location.state.error, 'error').then(
      () => {
        setError('');
      },
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
