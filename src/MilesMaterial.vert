
varying vec3 vNormal;

varying vec2 vUv;

varying vec3 eye;

void main() {

  vUv = uv;

	// normal
	vNormal = normalize(normalMatrix * normal);

	//position
	vec3 pos = position;

	vec4 ecPosition = modelViewMatrix * vec4(pos, 1.0);

	eye = normalize(ecPosition.xyz);

	gl_Position = projectionMatrix * ecPosition;


}