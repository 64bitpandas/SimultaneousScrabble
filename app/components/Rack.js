import '../css/rack.css';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import swal from '@sweetalert/with-react';
import {
  emit,
  getDropped,
  registerRack,
  setCurrLetter,
  setDropped,
  submit,
} from './Connection';
import { GLOBAL } from './GLOBAL';

/**
 * The letter rack that displays up to 7 currently unplayed tiles.
 */
export default class Rack extends Component {
  constructor(props) {
    super(props);
    this.state = {
      letters: [],
      // eslint-disable-next-line react/no-unused-state
      name: props.name,
      isPlaying: false,
    };
    registerRack(this);
    emit('forceUpdate', {});
  }

  render = () => {
    const renderRack = [];
    for (let i = 0; i < this.state.letters.length; i += 1) {
      renderRack.push(
        <Letter key={i} id={i} letter={this.state.letters[i]} rack={this} />,
      );
    }

    return (
      <div>
        <DragDropContext
          onDragEnd={this.onDragEnd}
          onDragStart={this.onDragStart}
        >
          <Droppable droppableId="rack" direction="horizontal">
            {provided => (
              <div ref={provided.innerRef}>
                <div id="rack">
                  {this.state.letters.map((item, index) => (
                    <Letter
                      // eslint-disable-next-line react/no-array-index-key
                      key={'' + index}
                      id={index}
                      index={index}
                      letter={item}
                      rack={this}
                    />
                  ))}
                </div>
                <div style={{ display: 'none' }}>{provided.placeholder}</div>
              </div>
            )}
          </Droppable>
        </DragDropContext>
        <div id="rack-buttons">
          <button
            className="rack-btn submit"
            onClick={submit}
            onKeyDown={submit}
            type="button"
          >
            Submit
          </button>
          <button
            className={
              this.state.isPlaying ? 'rack-btn skipturn' : 'rack-btn recall'
            }
            onClick={() => {
              emit('ready');
            }}
            type="button"
          >
            {this.state.isPlaying ? 'Skip Turn' : 'Ready'}
          </button>
        </div>
      </div>
    );
  };

  // moveCard = (dragIndex, hoverIndex) => {
  //   const dragCard = this.state.letters[dragIndex];
  //   this.setState(oldState => ({
  //     letters: oldState.letters.splice(
  //       [dragIndex, 1],
  //       [hoverIndex, 0, dragCard],
  //     ),
  //   }));
  //   console.log('set');
  //   setCurrLetter(this.state.letters[dragIndex].letter);
  // };

  onDragStart = result => {
    setCurrLetter(this.state.letters[result.source.index]);
  };

  onDragEnd = result => {
    setCurrLetter('');

    // dropped outside the list
    if (!result.destination) {
      if (getDropped()) {
        emit('useLetter', {
          name: this.state.name,
          letters: [
            ...this.state.letters.slice(0, result.source.index),
            ...this.state.letters.slice(result.source.index + 1),
          ],
        });
      }
      setDropped(false);
      return;
    }

    const reorder = (list, startIndex, endIndex) => {
      const r = Array.from(list);
      const [removed] = r.splice(startIndex, 1);
      r.splice(endIndex, 0, removed);

      return r;
    };

    this.setState(oldState => {
      const letters = reorder(
        oldState.letters,
        result.source.index,
        result.destination.index,
      );
      emit('shuffleLetters', {
        player: oldState.name,
        letters,
      });
      return { letters };
    });
  };
}

let blankInput = '';

/**
 * Represents a single letter on the rack.
 */
export const Letter = ({ letter, id, index, rack }) => {
  // const [, drag] = useDrag({
  //   item: { type: GLOBAL.TILE, letter },
  //   collect: monitor => ({
  //     isDragging: !!monitor.isDragging(),
  //     opacity: 0.9,
  //   }),
  //   end: (item, monitor) => {
  //     if (monitor.didDrop()) {
  //       emit('useLetter', {
  //         name: rack.state.name,
  //         letters: [
  //           ...rack.state.letters.slice(0, id),
  //           ...rack.state.letters.slice(id + 1),
  //         ],
  //       });
  //     }
  //   },
  // });

  const getStyle = (style, snapshot) => {
    if (!snapshot.isDropAnimating) {
      return style;
    }
    return {
      ...style,
      // cannot be 0, but make it super tiny
      transitionDuration: `0.001s`,
    };
  };

  /**
   * Allows players to enter custom letters into the blank tile by clicking on it.
   */
  const handleBlank = () => {
    if (!letter.includes('BLANK') && letter !== '*') return;
    swal({
      text: 'Set Blank Letter',
      buttons: {
        cancel: 'Cancel',
        submit: {
          text: 'Submit',
          value: 'submit',
        },
      },
      content: (
        <div>
          <p>Enter a valid letter from A to Z:</p>
          <input
            id="blankInput"
            type="text"
            className="blank-input"
            placeholder="Letter"
            maxLength="100"
            spellCheck="false"
            onChange={blankInputChange}
            onKeyDown={event => {
              if (
                event.key !== 'Backspace' &&
                event.key !== 'Delete' &&
                event.target.value.length === 1
              )
                event.preventDefault();
            }}
            autoComplete="off"
          />
        </div>
      ),
    }).then(value => {
      if (value !== null) {
        emit('setBlank', {
          player: rack.state.name,
          letter: blankInput,
          index,
        });
      }
    });
  };

  const blankInputChange = event => {
    blankInput = event.target.value;

    // setTimeout(() => {
    //   console.log(blankInput);
    // }, 1000);
  };

  return (
    <Draggable key={id} draggableId={'' + id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={
            letter.includes('BLANK') || letter.includes('*')
              ? 'blank-hover rack-letter'
              : 'rack-letter'
          }
          style={getStyle(provided.draggableProps.style, snapshot)}
          onClick={handleBlank}
          onKeyDown={handleBlank}
          role="button"
          tabIndex={index}
        >
          {letter.includes('BLANK') ? (
            <p className="blank">{letter.substring(6)}</p>
          ) : (
            letter
          )}
          <p className="letter-value">{GLOBAL.LETTER_VALUES[letter]}</p>
        </div>
      )}
    </Draggable>
  );
};

Letter.propTypes = {
  letter: PropTypes.string,
  id: PropTypes.number,
  index: PropTypes.number,
  rack: PropTypes.object,
};

Rack.propTypes = {
  name: PropTypes.string,
};
