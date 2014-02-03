var _ = require('underscore');
var Netcat = require('node-netcat');
var Readable = require('stream').Readable || require('readable-stream').Readable;
var split = require('split-json');

var JSONValid = require('../lib/utils').JSONValid;

module.exports = Subscribe;

function Subscribe (port, host, options) {
  if (!(this instanceof Subscribe)) return new Subscribe(port, host, options);
  Subscribe.init.call(this, port, host, options);
}

Subscribe.init = function (port, host, options) {
  // check args
  if (_.isObject(host)) {
    options = host;
    host = 'localhost';
  }

  this._port = port || 5000; 
  this._host = host || 'localhost';
  this._timeout = (options && options.timeout) || 3600000;
};

Subscribe.prototype.end = function () {
  return this._client.send(null, true);
};

Subscribe.prototype.start = function (channel, cb) {
  var self = this;

  this._client = Netcat.client(this._port, this._host, {timeout: this._timeout});

  var json = JSON.stringify({channel: channel});

  // events callbacks

  function open () { 
    setTimeout(function cb_send_channel () {
      self._client.send(json); 
    }, 500);
  }

  function close () { cb('{message: "client unsubscribe.", type: "warn"}'); }

  function error (err) { cb('{message: "' + err.message + '", type: "warn"}'); }
  
  function data (data) {
    // create the an readble stream
    var rs = new Readable();
    rs.push(data);
    rs.push(null);

    rs.pipe(split(/\n/)).on('data', function cb_data (data) {
      cb(null, data);
    });
  }

  // events

  this._client.on('open', open);
  this._client.on('data', data);
  this._client.on('error', error);
  this._client.on('close', close);

  this._client.start();
};