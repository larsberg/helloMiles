'use strict';
var THREE = require('three');
var glslify = require('glslify');

var MilesMaterial = function( options ){

	options = options || {};

	var params = {

		opacity: 0,
		transparent: false,
		blending: 0,
		depthTest: true,
		depthWrite: true,

		side: options.side !== undefined ? options.side : 1,

		shading: options.shading || THREE.SmoothShading,

		uniforms: {

			map: {type: 't', value: options.map },

			color: {type: 'c', value: options.color || new THREE.Color(0xFFFFFF) },

			facingRatioExponent: { type: 'f', value: options.facingRatioExponent || 1 },

			facingRatioScale: { type: 'f', value: options.facingRatioScale || .75 },

			opacity: { type: 'f', value: options.opacity || 1 },

			uTime: { type: 'f', value: options.uTime || 1 },

		},

		vertexShader: glslify('./MilesMaterial.vert'),

		fragmentShader: glslify('./MilesMaterial.frag'),
	}

	THREE.ShaderMaterial.call( this, params );
};

MilesMaterial.prototype = Object.create( THREE.ShaderMaterial.prototype );

module.exports = MilesMaterial;