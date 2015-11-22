/*jslint browser:true, node: true */
'use strict';

var THREE = require( 'three' );

function getDataTexture(data, w, h, format){

  data = data || [0,0,0,0];
  w = w || 1;
  h = h || 1;
  format = format || THREE.RGBAFormat;

  var t = new THREE.DataTexture(new Uint8Array(data), w, h, format);
  t.needsUpdate = true;

  return t;
}

module.exports = getDataTexture;
