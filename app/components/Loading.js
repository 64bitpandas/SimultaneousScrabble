import React from 'react';
import '../css/loading.css';

/**
 * Loading box that appears when attempting to join game.
 */
export default function Loading() {
  return (
    <div className="loading-overlay" id="loading">
      <div className="loadingbox box centered hidden" id="loading">
        <h3 className="title">Joining Game...</h3>
        <h5 className="info">
          Can take up to 30 seconds on first load (main servers are currently
          running on a free Heroku dyno!)
        </h5>
        <div className="spinner">
          <div className="double-bounce1" />
          <div className="double-bounce2" />
        </div>
      </div>
    </div>
  );
}
