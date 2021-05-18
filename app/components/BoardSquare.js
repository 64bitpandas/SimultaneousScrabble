import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useDrop, useDrag } from 'react-dnd';
import '../css/gameboard.css';
import { getGameboard, getCurrLetter, setDropped } from './Connection';
import { GLOBAL } from './GLOBAL';

/**
 * An object representing a single board square.
 */
export const BoardSquare = ({ space, name, canPlace, options }) => {
  const [hover, setHover] = useState(false);
  const [, drop] = useDrop({
    accept: GLOBAL.TILE,
    canDrop: () => canPlace && space.letter === '' && space.letter !== '*',
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
        <p className={'modifier ' + options.boardSize}>{space.modifier}</p>
      )}
      {hover && !(canPlace && space.letter === '') && (
        <div className="overlay-bad" />
      )}
      {hover && (canPlace && space.letter === '') && (
        <div className="overlay-good" />
      )}
      {/* {isOver && !canDrop && <div className="overlay-bad" />}
      {isOver && canDrop && <div className="overlay-good" />} */}
      {space.temp && (
        <FilledSquare letter={space.letter} id={space.id} options={options} />
      )}
      {!space.temp &&
        space.letter &&
        squareHTML(space.letter, space.color, options.boardSize)}
    </div>
  );
};

const FilledSquare = ({ letter, id, options }) => {
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
  return squareHTML(letter, 'red', options.boardSize, drag);
};

const squareHTML = (letter, color, size, ref) => (
  <div className="board-square" ref={ref}>
    <div className={'letter ' + color + ' ' + size}>
      {letter.includes('BLANK') ? letter.substring(6) : letter}
    </div>
    <div className={'letter-score ' + color + ' ' + size}>
      {letter.includes('BLANK') ? '*' : GLOBAL.LETTER_VALUES[letter]}
    </div>
  </div>
);

BoardSquare.propTypes = {
  space: PropTypes.object,
  name: PropTypes.string,
  canPlace: PropTypes.bool,
  options: PropTypes.object,
};
