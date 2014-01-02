var test = require('tape');
var _ = require('underscore');

var Publish = require('../').Publish;
var Subscribe = require('../').Subscribe;

var num_t = 201;

test('pub-sub', function (t) {
  t.plan(num_t);

  var pub = new Publish(5000, {timeout: 60000, encoding: 'ascii'});
  var sub = new Subscribe('localhost', 5000, {timeout: 60000, encoding: 'ascii'})
  
  pub.on('ready', function () { t.pass('publish, ready'); });
  pub.on('error', function (err) { t.error(err !== null, err); });
  pub.on('close', function () { t.pass('publish, close'); });


  var channel = 'xpto';

  // create some messages
  var messages = _.times(100, function (n) { return 'Hello World ' + new Date().getTime() + n; })


  // subscribing
  var rx = 0;
  sub.start(channel, function (err, data) {
    if (err) return t.ok(err, err);

    t.ok(data, 'rx ' + (++rx) + ' - ' + data);
  });

  // publishing
  setTimeout(function () {
    var tx = 0;
    _.each(messages, function  (msg) {
      pub.publish(channel, msg, function () {
        t.pass('tx ' + (++tx) + ' - ' + msg);
      });
    });
  }, 2000);
});