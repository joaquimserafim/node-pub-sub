var test = require('tape');
var Guid = require('guid');


function JSONValid (data) {
  try {
    return JSON.parse(data);
  } catch (err) {
    return null;
  }
}

var PubSub = require('../');

var Publish = PubSub.Publish;
var Subscribe = PubSub.Subscribe;

var num_t = 2002;

test('pub-sub', function (t) {
  t.plan(num_t);

  var pub = new Publish(7777, '127.0.0.1', {timeout:120000, encoding: 'ascii'});
  var sub = new Subscribe(7777, '127.0.0.1', {timeout: 120000, encoding: 'ascii'})
  
  pub.on('ready', function () { t.pass('publish, ready'); });
  pub.on('error', function (err) { t.error(err !== null, err); });
  pub.on('end', function () { t.pass('publish, ended'); });


  var channel = 'xpto';

  // create some messages
  var messages = [];

  for (var i = 0; i < 1000; i++)
    messages.push('Hello World ' + Guid.raw());

  var control_exit = messages.length;

  // subscribing
  sub.start(channel, function (err, obj) {
    if (err) return t.ok(err, err);
    //t.ok(_.isObject(obj), JSONhandler.stringify(obj));
    t.pass(obj);
    if (--control_exit === 0) {
      sub.end();
      setTimeout(function () { pub.end(); }, 500);
    }
  });


  // publishing
  setTimeout(function () {
    messages.forEach(function (msg) {
      pub.publish(channel, msg, function () {
        t.ok(msg, msg);
      });
    });
  }, 2000);
});