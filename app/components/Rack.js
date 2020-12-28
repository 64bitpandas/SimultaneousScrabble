import '../css/rack.css';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { useDrag } from 'react-dnd';
import { emit, registerRack, submit } from './Connection';
import { GLOBAL } from './GLOBAL';

export default class Rack extends Component {
  constructor(props) {
    super(props);
    this.state = {
      letters: [],
      // eslint-disable-next-line react/no-unused-state
      name: props.name,
    };
    registerRack(this);
    emit('forceUpdate', {});
  }

  render = () => {
    const renderRack = this.state.letters.map(letter => (
      <Letter
        key={this.state.letters.indexOf(letter)}
        id={this.state.letters.indexOf(letter)}
        letter={letter}
        rack={this}
      />
    ));

    return (
      <div>
        <div id="rack">{renderRack}</div>
        <div id="rack-buttons">
          <button
            className="rack-btn submit"
            onClick={submit}
            onKeyDown={submit}
            type="button"
          >
            Submit
          </button>
          <div className="rack-btn recall">Reset Rack</div>
        </div>
      </div>
    );
  };
}

export const Letter = ({ letter, id, rack }) => {
  const [, drag] = useDrag({
    item: { type: GLOBAL.TILE, letter },
    collect: monitor => ({
      isDragging: !!monitor.isDragging(),
      opacity: 0.9,
    }),
    end: (item, monitor) => {
      if (monitor.didDrop()) {
        emit('useLetter', {
          name: rack.state.name,
          letters: [
            ...rack.state.letters.slice(0, id),
            ...rack.state.letters.slice(id + 1),
          ],
        });
      }
    },
  });
  return (
    <div ref={drag} className="rack-letter">
      {letter}
    </div>
  );
};

Letter.propTypes = {
  letter: PropTypes.string,
  id: PropTypes.number,
  rack: PropTypes.object,
};

Rack.propTypes = {
  name: PropTypes.string,
};
