
uniform sampler2D map;

uniform vec3 color;

uniform float facingRatioExponent;

uniform float facingRatioScale;

uniform float opacity;

uniform float uTime;

varying vec3 vNormal;

varying vec2 vUv;

varying vec3 eye;

#define GAMMA 0.54545454545


vec3 getColor( vec3 e, float t ){
  return vec3( sin(t + e.x), cos(t * 1.25 + e.y), sin(t * .5 + e.z) ) * .5 + .5;
}

float rgbTogrey( vec3 rgb ){
  return dot( rgb, vec3(0.299, 0.587, 0.114) );
}

void main() {

    vec3 normal = normalize(vNormal);

    float fr = abs( dot(normalize(eye.xyz), -normal ) );
    float mfr = 1. - fr;

    vec4 c = texture2D( map, vUv );

    c.xyz *= 1.2;

    float cMix = pow( mfr, facingRatioExponent );

    gl_FragColor.xyz = mix( c.xyz, getColor(normal, uTime), cMix * 0.1 + rgbTogrey(c.xyz) * .25 );

    gl_FragColor.w = c.w;

}