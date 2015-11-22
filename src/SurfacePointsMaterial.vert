
uniform sampler2D map;

uniform float attenuationScale;
uniform float size;
uniform float time;

varying vec3 vColor;

vec3 getColor( vec3 e, float t ){
  return vec3( sin(t + e.x), cos(t * 1.25 + e.y), sin(t * .5 + e.z) ) * .5 + .5;
}

void main() {

  vec3 c = texture2D( map, uv ).xyz;

  vec3 pos = position + normalize(normal) * .0025;

	vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );

  vec3 vNormal = normalize(normalMatrix * normal);

  float fr = abs( dot(normalize(mvPosition.xyz), -vNormal ) );


  vColor = mix( c, getColor( pos, time ), vec3(fr * .5));

  pos += normal * (pow( fr, 3.0)) * 0.2;

  mvPosition = modelViewMatrix * vec4( pos, 1.0 );

	gl_Position = projectionMatrix * mvPosition;

	gl_PointSize = size * ( attenuationScale / -mvPosition.z ) * (1.0 - fr);



}