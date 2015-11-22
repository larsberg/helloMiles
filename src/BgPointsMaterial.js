'use strict';

var THREE = require('three');
var glslify = require('glslify')

var BgPointsMaterial = function( options ) {

	options = options || {};

	var matParams = {

		transparent: true,
		blending: options.blending || 2,
		depthTest: true,
		depthWrite: false,

		uniforms: {
			color: {type: 'c', value: options.color || new THREE.Color( 1, 1, 1 ) },
			opacity: {type: 'f', value: options.opacity || 0.1},
			size: { type: 'f', value: options.size || 70 },
			time: {type: 'f', value: 0},
			attenuationScale: {type: 'f', value: 500},
		},

		vertexShader: glslify('./BgPointsMaterial.vert'),

		fragmentShader: glslify('./BgPointsMaterial.frag')

	}

	THREE.ShaderMaterial.call( this, matParams );
}

BgPointsMaterial.prototype = Object.create( THREE.ShaderMaterial.prototype );

module.exports = BgPointsMaterial;

