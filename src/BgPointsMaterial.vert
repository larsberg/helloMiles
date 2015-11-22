uniform float attenuationScale;
uniform float size;
uniform float time;

varying vec3 vColor;

vec3 getColor( vec3 e, float t ){
  return vec3( sin(t + e.x), cos(t * 1.25 + e.y), sin(t * .5 + e.z) ) * .5 + .5;
}

void main() {

  vec3 pos = position;

  vColor = getColor( pos, time );



	vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );

  vec3 vNormal = normalize(normalMatrix * normal);

  float fr = abs( dot(normalize(mvPosition.xyz), -vNormal ) );

  // fr = (pow(fr, 1.0)) * 0.5 + 0.5;

  fr = pow( fr, 2.0 );

	gl_Position = projectionMatrix * mvPosition;

	gl_PointSize = size * ( attenuationScale / -mvPosition.z ) * fr;



}