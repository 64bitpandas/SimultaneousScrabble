/**
 * Client-side chat window connection, adapted for use from agario-clone (https://github.com/huytd/agar.io-clone/) by Ben Cuan
 * Created 17 April 2018
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { emit, registerChat } from './Connection';
import { GLOBAL } from './GLOBAL';
import '../css/chat.css';

/**
 * Manages player chat and commands.
 */
export default class ChatClient extends Component {
  // Use this constructor during init to connect ChatClient to the server
  constructor(props) {
    super(props);
    this.state = {
      player: props.player,
      cmds: {},
      chats: [],
      msgEl: null,
    };
    this.registerFunctions();
    registerChat(this);
    // const input = document.getElementById('chatInput');
    // input.addEventListener('keypress', key => {
    //   this.sendChat(key);
    // });
    // input.addEventListener('keyup', key => {
    //   input = document.getElementById('chatInput');
    //   // key = key.which || key.keyCode;
    //   //   if (key === global.KEY_ESC) {
    //   //     input.value = '';
    //   //     // self.canvas.cv.focus();
    //   //   }
    // });
  }

  render = () => (
    <div className="chatbox box" id="chatbox">
      <ul
        id="chatList"
        className="chat-list"
        ref={el => {
          this.state.msgEl = el;
        }}
      >
        {this.state.chats}
      </ul>
      <input
        id="chatInput"
        type="text"
        className="chat-input"
        placeholder="Chat here..."
        maxLength="100"
        spellCheck="false"
        onKeyDown={this.sendChat}
        autoComplete="off"
      />
    </div>
  );

  componentDidUpdate = () => {
    if (this.state.msgEl) {
      this.state.msgEl.scrollTo(0, this.state.msgEl.scrollHeight + 100);
    }
  };

  /**
   * Defines all commands and their behaviors.
   */
  registerFunctions = () => {
    this.registerCommand(
      'help',
      'Information about the chat commands.',
      this.printHelp,
    );

    this.registerCommand('define', 'Define a word.', args => {
      emit('requestDefinition', {
        word: args[0],
      });
    });

    // this.registerCommand('login', 'Login as an admin.', function (args) {
    //     self.socket.emit('pass', args);
    // });

    // this.registerCommand('kick', 'Kick a player, for admins only.', function (args) {
    //     self.socket.emit('kick', args);
    // });
    // global.chatClient = this;
  };

  /**
   * Places the message DOM node into the chat box.
   * @param {string} innerHTML The message to be displayed.
   * @param {string} color How the message should be styled - see `main.css` for styles and to create more styles.
   */
  appendMessage = (msg, style) => {
    // if (this.mobile) return;

    // const newline = React.createElement('li');

    // // Colours the chat input correctly.
    // newline.style.color = color;
    // // Add content
    // newline.innerHTML = innerHTML;

    // const chatList = document.getElementById('chatList');
    // // Remove old chats
    // if (chatList.childNodes.length > GLOBAL.MAX_CHATS) {
    //   chatList.removeChild(chatList.childNodes[0]);
    // }
    // chatList.appendChild(newline);
    // // Scroll to view new chat
    // chatList.scrollTop += 100;
    this.setState(prevState => ({
      chats: [
        ...prevState.chats,
        <li key={prevState.chats.length} className={style}>
          {msg}
        </li>,
      ],
    }));
  };

  /**
   * Chat box implementation for the users.
   * @param {string} name Name of the player who sent the message
   * @param {string} message Message that was sent
   * @param {boolean} me True if the sender matches the receiver
   */
  addChatLine = (name, message, me) => {
    if (me) {
      this.appendMessage(`(YOU): ${message}`, 'self-chat');
    } else {
      this.appendMessage(`${name}: ${message}`, 'chat');
    }
  };

  // /**
  //  * Chat box implementation for the users.
  //  * @param {string} name Name of the player who sent the message
  //  * @param {string} message Message that was sent
  //  * @param {boolean} me True if the sender matches the receiver
  //  */
  // addPrivateMessage(name, message, me) {
  //   this.appendMessage(
  //     `<b>${name.length < 1 ? GLOBAL.PLACEHOLDER_NAME : name}</b>: ${message}`,
  //     me ? 'me' : 'friend',
  //   );
  // }

  // Message to notify players when a new player joins
  addLoginMessage = (name, me) => {
    // console.log(`${name} joined`);
    if (!me) {
      this.appendMessage(`${name} has joined the room!`, 'join');
    }
  };

  // Places the message DOM node into the chat box.
  // appendMessage(node) {
  //     if (this.mobile) {
  //         return;
  //     }
  // const chatList = document.getElementById('chatList');
  // // if (chatList.childNodes.length > 10) {
  // //     chatList.removeChild(chatList.childNodes[0]);
  // // }
  // chatList.appendChild(node);
  // }

  // Sends a message or executes a command on the click of enter.
  sendChat = e => {
    const input = document.getElementById('chatInput');
    if (e.key === 'Enter') {
      const text = input.value.replace(/(<([^>]+)>)/gi, '');
      if (text !== '') {
        // Chat command.
        if (text.indexOf(GLOBAL.CMD_PREFIX) === 0) {
          const args = text.substring(1).split(' ');
          if (this.state.cmds[args[0]]) {
            this.state.cmds[args[0]].callback(args.slice(1));
          } else {
            this.appendMessage(
              `Unrecognized Command: ${text}, type -help for more info.`,
              'red',
            );
          }

          // Allows for regular messages to be sent to the server.
        } else {
          // Debug lines for messages - Remove on production
          // console.log("This Player: " + this.player);
          // console.log("This message: " + text);
          emit('playerChat', {
            sender: this.state.player,
            message: text,
          });
          this.addChatLine(this.state.player, text, true);
        }

        // Resets input.
        input.value = '';
        // this.canvas.cv.focus();
      }
    }
  };

  // Allows for addition of commands.
  registerCommand = (name, description, callback) => {
    // this.setState(prevState => ({
    //   commands: {
    //     ...prevState.commands,
    //     [name]: {
    //       description,
    //       callback,
    //     },
    //   },
    // }));
    this.state.cmds[name] = { description, callback };
    // this.setState({ cmds: { help: { description, callback } } });
  };

  // Allows help to print the list of all the commands and their descriptions.
  printHelp = () => {
    Object.keys(this.state.cmds).forEach(key => {
      if (this.state.cmds[key]) {
        this.appendMessage(
          `-${key}: ${this.state.cmds[key].description}`,
          'purple',
        );
      }
    });
  };
}

ChatClient.propTypes = {
  player: PropTypes.string,
};
