
uniform float opacity;

uniform vec3 color;

varying vec3 vColor;

void main(){

	vec2 uv = gl_PointCoord.xy * 2. - 1.;

	float alpha = max(0., (1. - dot(uv, uv) ));

  gl_FragColor = vec4( color * vColor, alpha * opacity );

}