import * as THREE from 'three';

/**
 * TELOS: INFINITE HORIZON - ATMOSPHERIC SCATTERING SHADER (GLSL)
 * Implements Rayleigh & Mie atmospheric light scattering
 */

export const AtmosphereVertexShader = `
  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying vec2 vUv;

  void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPos.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

export const AtmosphereFragmentShader = `
  uniform vec3 uSunPosition;
  uniform vec3 uAtmosphereColor;
  uniform vec3 uSunsetColor;
  uniform float uDensity;
  uniform float uRimPower;

  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying vec2 vUv;

  void main() {
    vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
    vec3 sunDir = normalize(uSunPosition);

    // Fresnel Rim Scattering
    float rim = 1.0 - max(0.0, dot(viewDirection, vNormal));
    rim = pow(rim, uRimPower);

    // Sun direction scattering influence (Rayleigh phase approximation)
    float sunDot = max(0.0, dot(vNormal, sunDir));
    vec3 scatteredColor = mix(uAtmosphereColor, uSunsetColor, pow(1.0 - sunDot, 2.0));

    // Combine atmospheric halo
    vec3 finalColor = scatteredColor * rim * uDensity * (0.6 + 0.4 * sunDot);
    float alpha = clamp(rim * uDensity, 0.0, 0.95);

    gl_FragColor = vec4(finalColor, alpha);
  }
`;

export function createAtmosphereMaterial(options?: {
  color?: string;
  sunsetColor?: string;
  density?: number;
  rimPower?: number;
}): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    vertexShader: AtmosphereVertexShader,
    fragmentShader: AtmosphereFragmentShader,
    uniforms: {
      uSunPosition: { value: new THREE.Vector3(50, 100, 50) },
      uAtmosphereColor: { value: new THREE.Color(options?.color || '#38bdf8') },
      uSunsetColor: { value: new THREE.Color(options?.sunsetColor || '#f97316') },
      uDensity: { value: options?.density || 1.2 },
      uRimPower: { value: options?.rimPower || 3.0 },
    },
    transparent: true,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    depthWrite: false,
  });
}
