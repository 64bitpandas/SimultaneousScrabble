/**
 *
 * App.js
 *
 * This component is the skeleton around the actual pages, and should only
 * contain code that should be seen on all pages. (e.g. navigation bar)
 *
 */

import React from 'react';
import { Switch, Route, HashRouter } from 'react-router-dom';

import HomePage from 'containers/HomePage/Loadable';
import NotFoundPage from 'containers/NotFoundPage/Loadable';
import GamePage from '../GamePage';

import GlobalStyle from '../../global-styles';

export default function App() {
  return (
    <div>
      <HashRouter>
        <Switch>
          <Route exact path="/" component={HomePage} />
          <Route exact path="/game" component={GamePage} />
          <Route component={NotFoundPage} />
        </Switch>
      </HashRouter>
      <GlobalStyle />
    </div>
  );
}
