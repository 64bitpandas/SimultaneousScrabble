import '../css/gameboard.css';
import React, { Component } from 'react';
import { emit, registerGameboard } from './Connection';

export default class Gameboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      // name: props.name,
      board: [],
    };
    registerGameboard(this);
    emit('forceUpdate', {});
  }

  render = () => <div id="gameboard">{this.renderBoard()}</div>;

  renderBoard = () =>
    this.state.board.map(row =>
      row.map(square => (
        <div className={'square ' + square.modifier} key={square.id}>
          <div className="letter {square.color}">
            {square.letter === null || square.letter === 'BLANK'
              ? ''
              : square.letter}
          </div>
          <div className="letter-score {square.color}">
            {letterValues[square.letter]}
          </div>
        </div>
      )),
    );
}

const letterValues = {
  BLANK: 0,
  A: 1,
  B: 3,
  C: 3,
  D: 2,
  E: 1,
  F: 4,
  G: 2,
  H: 4,
  I: 1,
  J: 8,
  K: 5,
  L: 1,
  M: 3,
  N: 1,
  O: 1,
  P: 3,
  Q: 10,
  R: 1,
  S: 1,
  T: 1,
  U: 1,
  V: 4,
  W: 4,
  X: 8,
  Y: 4,
  Z: 10,
};
