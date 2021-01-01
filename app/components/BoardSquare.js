import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useDrop, useDrag } from 'react-dnd';
import '../css/gameboard.css';
import { getGameboard, getCurrLetter, setDropped } from './Connection';
import { GLOBAL } from './GLOBAL';

export const BoardSquare = ({ space, name, canPlace }) => {
  const [hover, setHover] = useState(false);
  const [, drop] = useDrop({
    accept: GLOBAL.TILE,
    canDrop: () => canPlace && space.letter === '',
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

  const mouseOver = () => {
    if (getCurrLetter() !== '') setHover(true);
  };

  const mouseLeave = () => {
    setHover(false);
  };

  const mouseRelease = () => {
    if (getCurrLetter() !== '' && (canPlace && space.letter === '')) {
      getGameboard().tempUpdate(space.id, {
        id: space.id,
        temp: true,
        letter: getCurrLetter(),
        modifier: space.modifier,
        owner: name,
      });
      setDropped(true);
    }
  };

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      ref={drop}
      className={'square ' + space.modifier}
      key={space.id}
      onMouseUp={mouseRelease}
      onMouseEnter={mouseOver}
      onMouseLeave={mouseLeave}
      tabIndex={space.id}
    >
      {space.letter === '' && space.modifier !== 'CENTER' && (
        <p className="modifier">{space.modifier}</p>
      )}
      {hover && !(canPlace && space.letter === '') && (
        <div className="overlay-bad" />
      )}
      {hover && (canPlace && space.letter === '') && (
        <div className="overlay-good" />
      )}
      {/* {isOver && !canDrop && <div className="overlay-bad" />}
      {isOver && canDrop && <div className="overlay-good" />} */}
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
  canPlace: PropTypes.bool,
};
