var _ = require('underscore');
var Netcat = require('node-netcat');

var utils = require('./utils');


module.exports = Subscribe;

function Subscribe (host, port, options) {
  var self = this;

  if (!(self instanceof Subscribe)) return new Subscribe(host, port, options);

  self._port = port || 5000; 
  self._host = host || 'localhost';
  // enconding ascii (default)
  self._encoding = (options && options.encoding) || 'ascii';
  self._timeout = (options && options.timeout) || 60000;
}

Subscribe.prototype.start = function (channel, cb) {
  var self = this;

  self._client = Netcat.client(self._port, self._host, {
    timeout: self._timeout, 
    encoding: self._encoding
  });

  var json = utils.json.stringify({channel: channel});

  function open () { 
    setTimeout(function () {
      self._client.send(json);
    }, 1000); 
  }
  function close () { cb(new Error('Subscriber finish!!!')); }
  function error (err) { cb(new Error(err.message)); }

  var i = 0;
  function data (data) { 
    console.log(++i, data);

    cb();
  }

  self._client.on('open', open);
  self._client.on('data', data);
  self._client.on('error', error);
  self._client.on('close', close);

  self._client.start();
};