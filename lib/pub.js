var util = require('util');
var EventEmitter = require('events').EventEmitter;
var _ = require('underscore');
var Netcat = require('../../node-nc');

var utils = require('./utils');


// message model - json - {error: message_error, data: message}
module.exports = Publish;

function Publish (port, options) {
  var self = this;

  EventEmitter.call(self);

  if (!(self instanceof Publish)) return new Publish(port, options);

  // check the options
  self._port = port || 5000;
  // enconding ascii (default) || 'utf8', rx cannot be base64
  self._encoding = (options && options.encoding) || 'ascii';
  self._timeout = (options && options.timeout) || 60000;

  // constructor
  self._init();
}

util.inherits(Publish, EventEmitter);


Publish.prototype._init = function () {
  var self = this;

  self._channels = {};
  self._ready = false;// server is ready

  self._server = new Netcat.server(self._port, {timeout: self._timeout, encoding: self._encoding});

  function subscribe (client, data) {
    var json = utils.json.parse(data.toString(self._encoding));

    // check channel, bad channels closes connection
    // var exists = _.isObject(json) && 
    //               json.channel && 
    //               _.contains(_.keys(self._channels), json.channel);

    // if (!exists) return self._server.send(client, null, true);

    // channel does not exist
    if (_.isEmpty(self._channels[json.channel])) {
      self._channels[json.channel] = {clients: [client]};
      return;
    }

    // check client is already in subscribed list
    var exists = _.contains(self._channels[json.channel].clients, client);
    // no, then save client in channel list
    if (!exists) self._channels[json.channel].clients.push(client);
  }

  function unSubscribe (client) {
    function rm (channel) { channel.clients.splice(client, 1); }
    _.each(self._channels, rm);
  }

  function ready () { self.emit('ready'); }
  function error (err) { self.emit('error', err); }
  function close () { self.emit('close'); }

  // server events
  self._server.on('ready', ready);
  self._server.on('data', subscribe);
  self._server.on('client_off', unSubscribe);
  self._server.on('error', error);
  self._server.on('close', close);

  // emit to publish the messages
  self.on('new_msg', self._process);

  self._server.listen();
};

Publish.prototype.clients = function () {
  var self = this;
  return self._server.getClients();
};

Publish.prototype._process = function (channel, msg, cb) {
  var self = this;

  function processMsg (client) { self._server.send(client, msg, false, cb); }
  // get the clients for the channel and send message
  _.each(self._channels[channel].clients, processMsg);
};

Publish.prototype.publish = function (channel, msg, cb) {
  var self = this;
  // check callback
  cb = cb || function () {};
  // new channel init object
  if (_.isEmpty(self._channels[channel])) self._channels[channel] = {clients: []};
  // emit the new message to be published
  self.emit('new_msg', channel, msg, cb);
};