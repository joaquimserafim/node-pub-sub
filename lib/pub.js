var util = require('util');
var EventEmitter = require('events').EventEmitter;
var _ = require('underscore');
var Netcat = require('node-netcat');

var JSONhandler = require('../lib/utils').JSONhandler;


// message model - json - {error: message_error, data: message}
module.exports = Publish;

function Publish (port, options) {
  if (!(this instanceof Publish)) return new Publish(port, options);

  EventEmitter.call(this);

  var _self = this;

  // check the options
  this._port = port || 5000;
  // enconding ascii (default) || 'utf8', rx cannot be base64
  this._encoding = (options && options.encoding) || 'ascii';
  this._timeout = (options && options.timeout) || 3600000;
  // internal message numerator
  this._count = 0;

  // constructor
  _self._init();
}

util.inherits(Publish, EventEmitter);


Publish.prototype._init = function () {
  var _self = this;

  _self._channels = {};
  _self._ready = false;// server is ready

  _self._server = new Netcat.server(_self._port, 
    {timeout: _self._timeout, encoding: _self._encoding});

  // events callbacks

  function subscribe (client, data) {
    var json = JSONhandler.parse(data.toString(_self._encoding));

    // client is subscribing a channel does not exist yet
    if (_.isEmpty(_self._channels[json.channel])) {
      _self._channels[json.channel] = {clients: [client]};
      return;// exit
    }

    // check client is already in subscribed in channel
    var exists = _.contains(_self._channels[json.channel].clients, client);
    // no, then save client in channel list
    if (!exists) _self._channels[json.channel].clients.push(client);
  }

  function unSubscribe (client) {
    function rm (channel) { channel.clients.splice(client, 1); }
    _.each(_self._channels, rm);
  }

  function ready () { _self.emit('ready'); }

  function error (err) { _self.emit('error', err); }

  function end () { _self.emit('end'); }

  // server events
  _self._server.on('ready', ready);
  _self._server.on('data', subscribe);
  _self._server.on('client_off', unSubscribe);
  _self._server.on('error', error);
  _self._server.on('close', end);

  // emit to publish the messages
  _self.on('new_msg', _self._process);

  _self._server.listen();
};

Publish.prototype.clients = function () {
  return this._server.getClients();
};

Publish.prototype.end = function () {
  var _self = this;
  // lets close conn with clients
  _.each(_self._channels, function channels (channel) { 
    _.each(channel.clients, function clients (client) {
      _self._server.send(client, null, true);
    });
  });
  // now close server
  _self._server.close();
};

Publish.prototype._process = function (channel, msg, cb) {
  var _self = this;

  function processMsg (client) { _self._server.send(client, msg, false, cb); }
  // get the clients for the channel and send message
  _.each(_self._channels[channel].clients, processMsg);
};

Publish.prototype.publish = function (channel, msg, cb) {
  var _self = this;
  // check callback
  cb = cb || function () {};
  // new channel init object
  if (_.isEmpty(_self._channels[channel])) _self._channels[channel] = {clients: []};
  // inc numerator
  _self._count++;

  var data = JSONhandler.stringify({n: _self._count, tmx: new Date().getTime(), msg: msg}) + '\n';
  // emit the new message to be published
  _self.emit('new_msg', channel, data, cb);
};