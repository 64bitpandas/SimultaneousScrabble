import '../css/gameboard.css';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { emit, registerGameboard } from './Connection';
import { GLOBAL } from './GLOBAL';
import { BoardSquare } from './BoardSquare';

/**
 * The main gameboard grid that shows currently played tiles.
 * Tiles can be dragged from the rack onto the gameboard to play them.
 */
export default class Gameboard extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: props.name,
      board: [],
      canPlace: false,
      options: {},
      size: GLOBAL.SIZE.M,
    };
    registerGameboard(this);
    emit('forceUpdate', {});
  }

  render = () => (
    <div id="gameboard" className={this.state.options.boardSize}>
      {this.renderBoard()}
    </div>
  );

  /**
   * Maps gameboard data onto individual BoardSquare elements for rendering.
   */
  renderBoard = () =>
    this.state.board.map(row =>
      row.map(square => (
        <BoardSquare
          key={square.id}
          space={square}
          name={this.state.name}
          canPlace={this.state.canPlace}
          options={this.state.options}
        />
      )),
    );

  /**
   * Updates the current board with the server state,
   * removing any letters that have been overwritten by another player.
   * @param {*} newBoard Board data sent from the server.
   */
  updateBoard = newBoard => {
    if (this.state.board.length === 0) {
      this.setState({ board: newBoard });
    } else {
      this.setState(oldBoard => {
        const updatedBoard = Object.assign([], oldBoard.board);

        for (let row = 0; row < newBoard.length; row += 1) {
          for (let col = 0; col < newBoard.length; col += 1) {
            if (newBoard[row][col].letter !== '') {
              if (
                oldBoard.board[row][col].temp &&
                newBoard[row][col].owner !== oldBoard.board[row][col].owner
              ) {
                // someone placed a letter over temp letter
                this.tempRemove(row * oldBoard.size + col, true);
              }
              updatedBoard[row][col] = newBoard[row][col];
            }
          }
        }
        return { board: updatedBoard };
      });
    }
  };

  /**
   * User-placed tile (not submitted to server)
   * @param {number} id Square to update.
   * @param {*} data BoardSquare data
   */
  tempUpdate = (id, data) => {
    const [row, col] = this.rowCol(id);

    this.setState(oldBoard => {
      const updatedBoard = oldBoard.board;
      updatedBoard[row][col] = data;
      return { board: updatedBoard };
    });
  };

  /**
   * Called when a user drags a non-committed tile out of the board.
   * @param {number} id Square to update.
   * @param {string} requestLetter The letter to attempt to recover onto the rack.
   */
  tempRemove = (id, requestLetter) => {
    const [row, col] = this.rowCol(id);
    if (requestLetter) {
      emit('requestLetter', {
        name: this.state.name,
        letter: this.state.board[row][col].letter,
      });
    }
    this.setState(oldBoard => {
      const updatedBoard = oldBoard.board;
      updatedBoard[row][col].temp = false;
      updatedBoard[row][col].letter = '';
      return { board: updatedBoard };
    });
  };

  /**
   * Removes all temporary tiles from the board (e.g. the round has ended)
   */
  tempRemoveAll = () => {
    for (let row = 0; row < this.state.size; row += 1) {
      for (let col = 0; col < this.state.size; col += 1) {
        if (this.state.board[row][col].temp) {
          this.tempRemove(this.id(row, col), true);
        }
      }
    }
  };

  /**
   * Converts row-column pair to ID.
   * @param {number} row Board square row
   * @param {number} col Board square column
   * @returns {number} ID
   */
  id = (row, col) => row * this.state.size + col;

  /**
   * Converts ID to row-column pair.
   * @param {number} id The board square's ID
   * @returns {Array<number>} [row, col]
   */
  rowCol = id => [Math.floor(id / this.state.size), id % this.state.size];
}

Gameboard.propTypes = {
  name: PropTypes.string,
};
