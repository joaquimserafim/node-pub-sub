# node-pub-sub

<a href="https://nodei.co/npm/node-pub-sub/"><img src="https://nodei.co/npm/node-pub-sub.png"></a>

[![Build Status](https://travis-ci.org/joaquimserafim/node-pub-sub.png?branch=master)](https://travis-ci.org/joaquimserafim/node-pub-sub)

<img src="https://david-dm.org/joaquimserafim/node-pub-sub.png">


Implements Publish/Subscribe messaging paradigm in a very simple way.



### Some Wiki

In software architecture, publish–subscribe is a messaging pattern where senders of messages, called publishers, do not program the messages to be sent directly to specific receivers, called subscribers. Instead, published messages are characterized into classes, without knowledge of what, if any, subscribers there may be. Similarly, subscribers express interest in one or more classes, and only receive messages that are of interest, without knowledge of what, if any, publishers there are.

Pub/sub is a sibling of the message queue paradigm, and is typically one part of a larger message-oriented middleware system.

Most messaging systems support both the pub/sub and message queue models in their API, e.g. Java Message Service (JMS).



### API

All communication/messages it's done in JSON.

#### Publish
    
    require('node-pub-sub').Publish
      
    Publish([port], [host], [options])
      
     port: default to 5000
     host: default to localhost
     options: {timeout: 120000, encoding: 'ascii'}
          timeout: put a timeout like 1 hour or 6 hours because if spend much 
              time without publish messages the server will close the 
              connection, default to 3600000
          encoding: default to ascii, utf8
          
      
    events:
          ('ready', callback)
          ('error', callback (err))
          ('end', callback)
    
    
    // publish messages
    pub.publish('some channel', 'some message', [callback])
    
    // end
    pub.end()

#### Subscribe

    require('node-pub-sub').Publish
    
    Publish('localhost', 5000, {timeout: 120000, encoding: 'ascii'})
    
      host: default to localhost
      port: default to 5000
      options: {timeout: 120000, encoding: 'ascii'}
          timeout: put a timeout like 1 hour or 6 hours because if spend much
              time without publish messages the server will close the connection,
              default to 3600000
          encoding: default to ascii, utf8
          
    
    // subscribe to a channel      
    sub.start('some channel', callback ('error/warn message', 'message - json object'))
    
    // unsubscribe, for now unsubscribe to all channels
    sub.end()


### Examples

    **Publish**
    
    var Publish = require('node-pub-sub').Publish;
    
    var pub = new Publish(5000, {timeout: 120000, encoding: 'ascii'});
    
    pub.on('ready', function () { console.log('publish ready'); });
    pub.on('error', function (err) { console.log(err); });
    pub.on('end', function () { console.log('publish ended'); });
    

    pub.publish('some channel', 'some message', function () {
        // some acknowledgement
    });
    
    // close Publish    
    pub.end();
    
    
    
    **Subscribe**
    
    var Subscribe = require('node-pub-sub').Subscribe;
    
    var sub = new Subscribe('localhost', 5000, {
        timeout: 120000, encoding: 'ascii'
    });
    
    sub.start(channel, function (err, message) {
        // {message: "client unsubscribe.", type: "warn"}
        // {message: "some exception", type: "error"}
        if (err) throw err;
        
        // JSON object 
        console.log(message);
    });

    // unsubscribe when you want
    setTimeout(function () {
        sub.end();
    }, 60000);
    
    


