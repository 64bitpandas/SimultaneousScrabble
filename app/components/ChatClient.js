/**
 * Client-side chat window connection, adapted for use from agario-clone (https://github.com/huytd/agar.io-clone/) by Ben Cuan
 * Created 17 April 2018
 */

import { React } from 'react';
import PropTypes from 'prop-types';
import { emit } from './Connection';
import { GLOBAL } from './GLOBAL';

export default class ChatClient extends React.Component {
  // Use this constructor during init to connect ChatClient to the server
  constructor(props) {
    super(props);
    this.state = {
      player: props.player,
      commands: {},
    };
    const input = document.getElementById('chatInput');
    input.addEventListener('keypress', key => {
      this.sendChat(key);
    });
    // input.addEventListener('keyup', key => {
    //   input = document.getElementById('chatInput');
    //   // key = key.which || key.keyCode;
    //   //   if (key === global.KEY_ESC) {
    //   //     input.value = '';
    //   //     // self.canvas.cv.focus();
    //   //   }
    // });
  }

  render() {
    return (
      <div className="chatbox box" id="chatbox">
        <ul id="chatList" className="chat-list" />
        <input
          id="chatInput"
          type="text"
          className="chat-input"
          placeholder="Chat here..."
          maxLength="50"
          spellCheck="false"
          onKeyDown={this.sendChat}
        />
      </div>
    );
  }

  /**
   * Defines all commands and their behaviors.
   */
  registerFunctions() {
    const self = this;

    this.registerCommand('help', 'Information about the chat commands.', () => {
      self.printHelp();
    });

    // this.registerCommand('login', 'Login as an admin.', function (args) {
    //     self.socket.emit('pass', args);
    // });

    // this.registerCommand('kick', 'Kick a player, for admins only.', function (args) {
    //     self.socket.emit('kick', args);
    // });
    global.chatClient = this;
  }

  /**
   * Places the message DOM node into the chat box.
   * @param {string} innerHTML The message to be displayed.
   * @param {string} color How the message should be styled - see `main.css` for styles and to create more styles.
   */
  appendMessage(innerHTML, color) {
    if (this.mobile) return;

    const newline = document.createElement('li');

    // Colours the chat input correctly.
    newline.style.color = color;
    // Add content
    newline.innerHTML = innerHTML;

    const chatList = document.getElementById('chatList');
    // Remove old chats
    if (chatList.childNodes.length > GLOBAL.MAX_CHATS) {
      chatList.removeChild(chatList.childNodes[0]);
    }
    chatList.appendChild(newline);
    // Scroll to view new chat
    chatList.scrollTop += 100;
  }

  /**
   * Chat box implementation for the users.
   * @param {string} name Name of the player who sent the message
   * @param {string} message Message that was sent
   * @param {boolean} me True if the sender matches the receiver
   * @param {string} sendingTeam The name of the team that sent this message
   */
  addChatLine(name, message, me) {
    this.appendMessage(
      `<b style="color: ${GLOBAL.CHAT_COLOR}">${
        name.length < 1 ? GLOBAL.PLACEHOLDER_NAME : name
      } ${me ? '(YOU)' : ''}</b>: ${message}`,
      GLOBAL.CHAT_COLOR,
    );
  }

  /**
   * Chat box implementation for event announcements (capturing, etc)
   * @param {string} message What message was sent
   * @param {string} sendingTeam Subject of the message.
   */
  addChatAnnouncement(message) {
    this.appendMessage(message, GLOBAL.CHAT_ANNOUNCE_COLOR);
  }

  /**
   * Chat box implementation for the users.
   * @param {string} name Name of the player who sent the message
   * @param {string} message Message that was sent
   * @param {boolean} me True if the sender matches the receiver
   */
  addPrivateMessage(name, message, me) {
    this.appendMessage(
      `<b>${name.length < 1 ? GLOBAL.PLACEHOLDER_NAME : name}</b>: ${message}`,
      me ? 'me' : 'friend',
    );
  }

  // Message to notify players when a new player joins
  addLoginMessage(name, me) {
    // console.log(`${name} joined`);
    if (!me) {
      this.appendMessage(
        `<b>${
          name.length < 1 ? GLOBAL.PLACEHOLDER_NAME : this.state.player
        } </b> has
        joined the room!`,
      );
    }
  }

  // Chat box implementation for the system.
  addSystemLine(message) {
    this.appendMessage(message, 'system');
  }

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
  sendChat(e) {
    const input = document.getElementById('chatInput');

    if (e.key === GLOBAL.KEY_ENTER) {
      const text = input.value.replace(/(<([^>]+)>)/gi, '');
      if (text !== '') {
        // Chat command.
        if (text.indexOf(this.commandPrefix) === 0) {
          const args = text.substring(1).split(' ');
          if (this.state.commands[args[0]]) {
            this.state.commands[args[0]].callback(args.slice(1));
          } else {
            this.addSystemLine(
              `Unrecognized Command: ${text}, type -help for more info.`,
            );
          }

          // Allows for regular messages to be sent to the server.
        } else {
          // Debug lines for messages - Remove on production
          // console.log("This Player: " + this.player);
          // console.log("This message: " + text);
          emit('playerChat', {
            sender: this.player,
            message: text,
            sendingTeam: this.team,
          });
          this.addChatLine(this.player, text, true);
        }

        // Resets input.
        input.value = '';
        // this.canvas.cv.focus();
      }
    }
  }

  // Allows for addition of commands.
  registerCommand(name, description, callback) {
    this.commands[name] = {
      description,
      callback,
    };
  }

  // Allows help to print the list of all the commands and their descriptions.
  printHelp() {
    Object.keys(this.state.commands).forEach(key => {
      if (this.state.commands[key].cmd) {
        this.addSystemLine(
          `-${this.state.commands[key].cmd}: ${
            this.state.commands[key].description
          }`,
        );
      }
    });
  }
}

ChatClient.propTypes = {
  player: PropTypes.string,
};
