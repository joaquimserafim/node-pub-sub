var _ = require('underscore');
var Netcat = require('node-netcat');
var Readable = require('stream').Readable || require('readable-stream').Readable;
var split = require('split-json');


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

  this._port = port; 
  this._host = host || 'localhost';
  this._timeout = (options && options.timeout) || 3600000;

  this._client = Netcat.client(this._port, this._host, {timeout: this._timeout});
};

Subscribe.prototype.end = function () {
  return this._client.send(null, true);
};

Subscribe.prototype.start = function (channel, cb) {
  var self = this;

  var json = JSON.stringify({channel: channel});

  // events callbacks

  function open () { 
    setTimeout(function cb_send_channel () {
      self._client.send(json); 
    }, 500);
  }

  function error (err) { cb(err); }
  
  function data (data) {
    // create a readable stream
    var rs = new Readable();
    rs.push(data);
    rs.push(null);

    rs.pipe(split(/\n/)).on('data', function cb_data (data) { cb(null, data); });
  }

  // events

  this._client.on('open', open);
  this._client.on('data', data);
  this._client.on('error', error);

  this._client.start();
};