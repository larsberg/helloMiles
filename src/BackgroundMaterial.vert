
// varying vec3 vNormal;

varying vec3 eye;

void main() {

	// normal
	// vNormal = normalize(normalMatrix * normal);

	//position
	vec3 pos = position;

	vec4 ecPosition = modelViewMatrix * vec4(pos, 1.0);

	eye = pos * 0.001;// normalize(ecPosition.xyz);

	gl_Position = projectionMatrix * ecPosition;


}