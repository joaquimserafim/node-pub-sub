var test = require('tape');
var Guid = require('guid');
var _ = require('underscore');

var Publisher = require('../').Publisher;

var pub = new Publisher();


test('client subscribing a channel don\'t exists', function (t) {
  t.plan(1);

  pub.start(function (err) {
    t.equal(err !== null, true, err);
  });
});



/*

 // when server start to listener launch this method
    // check you don't need this method to start publish messages
    // it's used only if you want to confirm server is online
    // create messages to publish
    _.map(['test0'], function (channel) {
      var n = _.random(100, 200);

      t.plan(n + 1);
      for (var i = 0; i < n; i++) {
        var message = Guid.raw();
        var res = pub.publish(channel, message);
        t.equal(res, true, 'publish in channel ' + channel + ' a new message ' + message);
      }
    });


*/