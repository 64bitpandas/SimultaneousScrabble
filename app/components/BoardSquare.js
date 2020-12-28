import React from 'react';
import PropTypes from 'prop-types';
import { useDrop, useDrag } from 'react-dnd';
import '../css/gameboard.css';
import { getGameboard } from './Connection';
import { GLOBAL } from './GLOBAL';

export const BoardSquare = ({ space, name }) => {
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: GLOBAL.TILE,
    canDrop: () => space.letter === '',
    drop: item =>
      getGameboard().tempUpdate(space.id, {
        id: space.id,
        temp: true,
        letter: item.letter,
        modifier: space.modifier,
        owner: name,
      }),
    collect: monitor => ({
      isOver: !!monitor.isOver(),
      canDrop: !!monitor.canDrop(),
    }),
  });
  return (
    <div ref={drop} className={'square ' + space.modifier} key={space.id}>
      {isOver && !canDrop && <div className="overlay-bad" />}
      {isOver && canDrop && <div className="overlay-good" />}
      {space.temp && <FilledSquare letter={space.letter} id={space.id} />}
      {!space.temp && space.letter && squareHTML(space.letter, space.color)}
    </div>
  );
};

const FilledSquare = ({ letter, id }) => {
  const [, drag] = useDrag({
    item: { type: GLOBAL.TILE, letter },
    collect: monitor => ({
      isDragging: !!monitor.isDragging(),
      opacity: 0.9,
    }),
    end: (item, monitor) => {
      getGameboard().tempRemove(id, !monitor.didDrop());
    },
  });
  return squareHTML(letter, 'red', drag);
};

const squareHTML = (letter, color, ref) => (
  <div className="board-square" ref={ref}>
    <div className={'letter ' + color}>
      {letter === null || letter === 'BLANK' ? '' : letter}
    </div>
    <div className={'letter-score ' + color}>
      {GLOBAL.LETTER_VALUES[letter]}
    </div>
  </div>
);

BoardSquare.propTypes = {
  space: PropTypes.object,
  name: PropTypes.string,
};
