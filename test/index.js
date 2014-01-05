var test = require('tape');
var _ = require('underscore');
var Guid = require('guid');

var JSONhandler = require('../lib/utils').JSONhandler;

var PubSub = require('../');

var Publish = PubSub.Publish;
var Subscribe = PubSub.Subscribe;

var num_t = 2003;

test('pub-sub', function (t) {
  t.plan(num_t);

  var pub = new Publish(5000, {timeout:120000, encoding: 'ascii'});
  var sub = new Subscribe('localhost', 5000, {timeout: 120000, encoding: 'ascii'})
  
  pub.on('ready', function () { t.pass('publish, ready'); });
  pub.on('error', function (err) { t.error(err !== null, err); });
  pub.on('end', function () { t.pass('publish, ended'); });


  var channel = 'xpto';

  // create some messages
  var messages = _.times(1000, function (n) { return 'Hello World ' + Guid.raw(); })

  var control_exit = 0;

  // subscribing
  sub.start(channel, function (err, obj) {
    if (err) return t.ok(err, err);
    t.ok(_.isObject(obj), JSONhandler.stringify(obj));

    if (++control_exit === 1000) {
      sub.end();
      setTimeout(function () { pub.end(); }, 500);
    }
  });


  // publishing
  setTimeout(function () {
    _.each(messages, function  (msg) {
      pub.publish(channel, msg, function () {
        t.ok(msg, msg);
      });
    });
  }, 2000);
});