var _ = require('underscore');
var Netcat = require('node-netcat');
var Readable = require('stream').Readable;
var split = require('split-json');

var JSONhandler = require('../lib/utils').JSONhandler;

module.exports = Subscribe;

function Subscribe (host, port, options) {
  if (!(this instanceof Subscribe)) return new Subscribe(host, port, options);

  var _self = this;

  _self._port = port || 5000; 
  _self._host = host || 'localhost';
  // enconding ascii (default)
  _self._encoding = (options && options.encoding) || 'ascii';
  _self._timeout = (options && options.timeout) || 3600000;
}

Subscribe.prototype.end = function () {
  var _self = this;
  _self._client.send(null, true);
};

Subscribe.prototype.start = function (channel, cb) {
  var _self = this;

  _self._client = Netcat.client(_self._port, _self._host, {
    timeout: _self._timeout, 
    encoding: _self._encoding
  });

  var json = JSONhandler.stringify({channel: channel});

  // events callbacks

  function open () { 
    setTimeout(function () {
      _self._client.send(json); 
    }, 500); 
  }

  function close () { cb('{message: "client unsubscribe.", type: "warn"}'); }

  function error (err) { cb('{message: "' + err.message + '", type: "warn"}'); }
  
  function data (data) {
    // create the an readble stream
    var rs = new Readable();
    rs.push(data);
    rs.push(null);
    // lets split the strem into JSON objects
    split(rs, function (err, obj) {
      cb(err, obj);
    });
  }

  // events

  _self._client.on('open', open);
  _self._client.on('data', data);
  _self._client.on('error', error);
  _self._client.on('close', close);

  _self._client.start();
};