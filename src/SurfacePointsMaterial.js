'use strict';

var THREE = require('three');
var glslify = require('glslify')

var SurfacePointsMaterial = function( options ) {

	options = options || {};

	var matParams = {

		transparent: true,
		blending: options.blending || 2,
		depthTest: true,
		depthWrite: false,

		uniforms: {
			map: {type: 't', value: options.map },
			color: {type: 'c', value: options.color || new THREE.Color( 1, 1, 1 ) },
			opacity: {type: 'f', value: options.opacity || 0.1},
			size: { type: 'f', value: options.size || 50 },
			time: {type: 'f', value: 0},
			attenuationScale: {type: 'f', value: 1000},
		},

		vertexShader: glslify('./SurfacePointsMaterial.vert'),

		fragmentShader: glslify('./SurfacePointsMaterial.frag')

	}

	THREE.ShaderMaterial.call( this, matParams );
}

SurfacePointsMaterial.prototype = Object.create( THREE.ShaderMaterial.prototype );

module.exports = SurfacePointsMaterial;

