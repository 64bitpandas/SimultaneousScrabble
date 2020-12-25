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

export default function HomePage() {
  return (
    <div id="container">
      <MainPanel />
    </div>
  );
}
