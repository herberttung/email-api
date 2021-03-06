import createError from 'http-errors'
import express from 'express'
import cookieParser from 'cookie-parser'
import logger from 'morgan'
import debug from 'debug'
import http from 'http'
import cron from 'node-cron'
import indexRouter from './routes/index'
import rp from 'request-promise'

require('dotenv').config()

const app = express();

// view engine setup
app.use(logger(':date[iso] :method :url :status :response-time ms - :res[content-length]'));
app.use(express.urlencoded({ limit: '20000mb', extended: true }));
app.use(express.json({ limit: '20000mb', extended: true }));
//app.use(bodyparser.json({limit: '50mb', extended: true}));
//app.use(bodyparser.urlencoded( {limit: '50mb', extended: true} ));
//app.use(cookieParser());
app.use(express.json());

app.use('/emailapi/', indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;


//rp(process.env.LOCALHOST + '/4objectCreate')

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */

const server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port, '0.0.0.0');
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}

cron.schedule('30 */3 * * * *', () => {
  rp('http://' + process.env.LOCALHOST + ':' + process.env.PORT + '/emailapi/recheckJobs')
});
//rp('http://127.0.0.1:3001/email/get')
