
var tape = require('tape');



var Publisher = require('../').Publisher;


var pub = new Publisher();


pub.start(function (err) {
  console.log(err, pub.info());
});


pub.publish('test', 'a new message 0');
pub.publish('test', 'a new message 1');
pub.publish('test', 'a new message 2');
pub.publish('test', 'a new message 3');
pub.publish('test', 'a new message 4');