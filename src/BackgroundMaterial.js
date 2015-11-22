'use strict';
var THREE = require('three');
var glslify = require('glslify');

var BackgroundMaterial = function( options ){

	options = options || {};

	var params = {

		opacity: 1,
		transparent: false,
		blending: 1,
		depthTest: true,
		depthWrite: true,

		side: options.side !== undefined ? options.side : 1,

		shading: options.shading || THREE.SmoothShading,

		uniforms: {

			color: {type: 'c', value: options.color || new THREE.Color(0xFFFFFF) },

			facingRatioExponent: { type: 'f', value: options.facingRatioExponent || 3 },

			facingRatioScale: { type: 'f', value: options.facingRatioScale || 1.1 },

			opacity: { type: 'f', value: options.opacity || 1 },

			uTime: { type: 'f', value: options.uTime || 1 },

		},

		vertexShader: glslify('./BackgroundMaterial.vert'),

		fragmentShader: glslify('./BackgroundMaterial.frag'),
	}

	THREE.ShaderMaterial.call( this, params );
};

BackgroundMaterial.prototype = Object.create( THREE.ShaderMaterial.prototype );

module.exports = BackgroundMaterial;