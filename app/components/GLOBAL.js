export const GLOBAL = {
  CMD_PREFIX: '-', // Prefix for chat commands
  LOCALHOST: 'localhost:3000',
  MAIN_SERVER: 'scrabbleserver.bencuan.me',
  PLACEHOLDER_NAME: 'Unknown Player',
  CHAT_COLOR: '#FFFFFF',
  CHAT_ANNOUNCE_COLOR: '#abcdef',
  SIZE: {
    // Height/width of small/medium/large board
    S: 11,
    M: 15,
    L: 19,
  },
  TILE: 'tile', // Accept type for drag and drop
  MAX_NAME_LENGTH: 30, // character limit for usernames
  TIMEOUT: 30000, // Time before dropping connection attempt, in ms
  LETTER_VALUES: {
    // Number of points per letter. The following config is from standard Scrabble
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
  },
  INFO: `Simultaneous Scrabble is just like normal Scrabble, except everyone plays at the same time rather than taking turns!\n
  This makes it great for speeding up gameplay, which is optimal for larger numbers of players.\n
  The rules are the same as Scrabble otherwise- simply drag your tiles onto the board and hit submit to play.\n
  During the CHALLENGING PHASE, you can challenge plays that you believe aren't actually words. If it wasn't, then the person who played it loses a turn. Otherwise, you lose a turn.\n
  The game ends when all players use up all of their tiles.`,
};
