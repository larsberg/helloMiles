/*jslint browser: true, node: true*/
'use strict';

var $ = require('jquery');

module.exports = function( options ){
  var c = $('<div>').css({
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0)',
    overflow: 'hidden'
  }).appendTo('body');

  return c;
}