var util = require('util');
var EventEmitter = require('events').EventEmitter;
var _ = require('underscore');
var Netcat = require('node-netcat');

var JSONValid = require('../lib/utils').JSONValid;


// message model - json - {error: message_error, data: message}
module.exports = Publish;

function Publish (port, host, options) {
  if (!(this instanceof Publish)) return new Publish(port, host, options);
  EventEmitter.call(this);
  Publish.init.call(this, port, host, options);
}

util.inherits(Publish, EventEmitter);


Publish.init = function (port, host, options) {
  var self = this;

  // check the options

  if (_.isObject(host)) {
    options = host;
    host = 'localhost';
  }

  this._port = port || 5000;
  this._host = host || 'localhost';
  this._timeout = (options && options.timeout) || 3600000;

  // internal message numerator
  this._count = 0;

  this._channels = {};
  this._ready = false;// server is ready

  this._server = new Netcat.server(this._port, this._host, {timeout: this._timeout});

  // events callbacks

  function subscribe (client, data) {
    var json = JSONValid(data.toString());

    // not valid, exit
    if (!json) return self._server.send(client, null, true);

    // client is subscribing a channel does not exist yet
    if (_.isEmpty(self._channels[json.channel])) {
      self._channels[json.channel] = {clients: [client]};
      return;// exit
    }

    // check client is already in subscribed in channel
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

  function end () { self.emit('end'); }

  // server events
  this._server.on('ready', ready);
  this._server.on('data', subscribe);
  this._server.on('client_off', unSubscribe);
  this._server.on('error', error);
  this._server.on('close', end);

  // emit to publish the messages
  this.on('new_msg', self._process);

  this._server.listen();
};

Publish.prototype.clients = function () {
  return this._server.getClients();
};

Publish.prototype.end = function () {
  // lets close conn with clients
  _.each(this._channels, function channels (channel) { 
    _.each(channel.clients, function clients (client) {
      this._server.send(client, null, true);
    });
  });
  // now close server
  this._server.close();
};

Publish.prototype._process = function (channel, msg, cb) {
  var self = this;

  function processMsg (client) { self._server.send(client, msg, false, cb); }
  // get the clients for the channel and send message
  _.each(this._channels[channel].clients, processMsg);
};

Publish.prototype.publish = function (channel, msg, cb) {
  // check callback
  cb = cb || function () {};
  // new channel init object
  if (_.isEmpty(this._channels[channel])) this._channels[channel] = {clients: []};

  // inc numerator
  this._count++;  

  var data = JSON.stringify({n: this._count, tmx: new Date().getTime(), msg: msg}) + '\n';
  // emit the new message to be published
  this.emit('new_msg', channel, data, cb);
};