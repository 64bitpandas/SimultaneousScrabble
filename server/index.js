/* eslint-disable no-console */
/* eslint consistent-return:0 import/order:0 */

require('colors'); // Console colors :D
const express = require('express');
const logger = require('./logger');
const socket = require('./socket');
const argv = require('./argv');
const port = require('./port');
const constants = require('./constants');
const setup = require('./middlewares/frontendMiddleware');
const isDev = process.env.NODE_ENV !== 'production';
const ngrok =
  (isDev && process.env.ENABLE_TUNNEL) || argv.tunnel
    ? require('ngrok')
    : false;
const { resolve } = require('path');
const app = express();
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept-Type',
  );
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
}, express.static(__dirname, { dotfiles: 'allow' }));
// If you need a backend, e.g. an API, add your custom backend-specific middleware here
const http = require('http').createServer(app);
const io = require('socket.io')(http);

// In production we need to pass these values in instead of relying on webpack
setup(app, {
  outputPath: resolve(process.cwd(), 'build'),
  publicPath: '/',
});

// get the intended host and port number, use localhost and port 3000 if not provided
const customHost = argv.host || process.env.HOST;
const host = customHost || null; // Let http.Server use its default IPv6/4 host
const prettyHost = customHost || 'localhost';

// use the gzipped bundle
app.get('*.js', (req, res, next) => {
  req.url = req.url + '.gz'; // eslint-disable-line
  res.set('Content-Encoding', 'gzip');
  next();
});

// Start your app.
app.listen(constants.LOCAL_PORT, host, async err => {
  if (err) {
    return logger.error(err.message);
  }

  // Connect to ngrok in dev mode
  if (ngrok) {
    let url;
    try {
      url = await ngrok.connect(port);
    } catch (e) {
      return logger.error(e);
    }
    logger.appStarted(port, prettyHost, url);
  } else {
    logger.appStarted(port, prettyHost);
  }
});

// Setup socket
socket.setupSocket(io);

http.listen(port, () => {
  console.log(
    `--------------------------------\n`.gray +
      `Server listening on port ${port}\n`.cyan +
      `--------------------------------\n`.gray,
  );
});
