// Publisher part
var net = require('net');

var Guid = require('guid');
var _ = require('underscore');


var utils = require('./utils');


module.exports = Publisher;
function Publisher (options) {
  var self = this;
  if (!(self instanceof Publisher)) return new Publisher(options);

  // check the options
  self.port = (options && options.port) || 5000;
  // enconding json (defualt), ascii, utf8
  self.enconding = (options && options.enconding) || 'json';

  self.clients = {};
  self.channels = {};
  self.status = false;
}

Publisher.prototype.info = function (msg) {
  var self = this;
  return {
    on: self.status,
    clients: _.keys(self.clients),
    channels: self.channels
  };
};

Publisher.prototype.publish = function (channel, msg) {
  var self = this;

  // init object for first time
  if (_.isEmpty(self.channels[channel])) self.channels[channel] = {};

  var key = Guid.raw();
  var obj = {};
  // obj message
  obj[key] = {value: msg, tmx: new Date().getTime()};
  _.extend(self.channels[channel], obj);

  return true;
};

Publisher.prototype.start = function (cb) {
  var self = this;

  self.server = net.createServer(function (socket) {
    var client = socket.remoteAddress + ':' + socket.remotePort;
    
    // socket configurations
    socket.setKeepAlive(true, 86400000);// 1 day
    socket.setTimeout(3600000);// 1 hour


    // client events

    socket.on('timeout', function () { socket.destroy(); });

    socket.on('close', function () { delete self.clients[client]; });

    socket.on('data', function (buffer) {
      var json = utils.execJSON(buffer.toString('ascii'));
      
      if (!json || !json.channel) {
        socket.destroy();
        return cb(new Error('client "' + client + '" bad channel'));
      }
      self.clients[client].channel = json.channel;
    });
  });


  // server events

  self.server.on('listening', function () { self.status = true; });

  // Note: when a new client connect this event will be triggered
  self.server.on('connection', function (socket) { self.clients[socket.remoteAddress + ':' + socket.remotePort] = socket; });

  self.server.on('close', function () { throw new Error('Publisher close unexpected'); });

  self.server.on('error', function (err) { throw err; });

  self.server.listen(self.port);
};
