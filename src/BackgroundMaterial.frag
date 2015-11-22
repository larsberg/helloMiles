
// uniform sampler2D map;

uniform vec3 color;

uniform float facingRatioExponent;

uniform float facingRatioScale;

uniform float opacity;

uniform float uTime;

// varying vec3 vNormal;

varying vec3 eye;

#define GAMMA 0.54545454545

vec3 getColor( vec3 e, float t ){
  return vec3( sin(t + e.x), cos(t * 1.25 + e.y), sin(t * .5 + e.z) ) * .5 + .5;
}

void main() {

  vec3 e = normalize(eye);

	gl_FragColor = vec4( getColor( e, uTime ), 1.0 );

	gl_FragColor.xyz = gl_FragColor.xyz * .5 + .5;

}