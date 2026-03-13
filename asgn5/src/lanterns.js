import * as THREE from 'three';

const LANTERN_COLORS = [
  { color: 0xff8833, emissive: 0xff5500 },
  { color: 0xffaa22, emissive: 0xff7700 },
  { color: 0xff6622, emissive: 0xdd3300 },
  { color: 0xffcc44, emissive: 0xffaa00 },
  { color: 0xff9944, emissive: 0xff6600 },
  { color: 0xffbb33, emissive: 0xff8800 },
  { color: 0xff7722, emissive: 0xee4400 },
  { color: 0xffdd55, emissive: 0xffbb11 },
];

const SUNSET_COLORS = [
  { color: 0xcc2244, emissive: 0xaa0022 },
  { color: 0xdd44aa, emissive: 0xbb2288 },
  { color: 0x882299, emissive: 0x661177 },
  { color: 0xff6688, emissive: 0xdd3355 },
  { color: 0xee3366, emissive: 0xcc1144 },
  { color: 0x993388, emissive: 0x771166 },
  { color: 0xff4455, emissive: 0xdd2233 },
  { color: 0xcc5599, emissive: 0xaa3377 },
];

export function initLanterns(scene) {
  const ringMat = new THREE.MeshPhongMaterial({ color: 0x5c3a1e });

  const lanternOrigins = [
    new THREE.Vector3(-3.0, 5.5, -1.5),
    new THREE.Vector3( 2.5, 7.2, -2.5),
    new THREE.Vector3(-0.5, 6.5, -4.0),
    new THREE.Vector3( 1.0, 5.0,  1.5),
    new THREE.Vector3(-1.5, 6.0,  0.0),
    new THREE.Vector3( 0.5, 7.5, -0.5),
    new THREE.Vector3(-2.5, 5.8,  1.0),
    new THREE.Vector3( 2.0, 6.8, -1.0),
  ];

  const lanternMats = [];

  const skyLanterns = lanternOrigins.map((origin, i) => {
    const { color, emissive } = LANTERN_COLORS[i % LANTERN_COLORS.length];

    const bodyMat = new THREE.MeshStandardMaterial({
      color,
      emissive,
      emissiveIntensity: 0.7,
      transparent: true,
      opacity: 0.88,
    });
    lanternMats.push(bodyMat);

    const group = new THREE.Group();
    group.position.copy(origin);

    const body = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.65, 0.48), bodyMat);
    body.castShadow = true;
    group.add(body);

    const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.19, 0.05, 10), ringMat);
    ring.position.y = -0.35;
    group.add(ring);

    scene.add(group);
    return group;
  });

  function setSunsetMode(on) {
    const palette = on ? SUNSET_COLORS : LANTERN_COLORS;
    lanternMats.forEach((mat, i) => {
      const { color, emissive } = palette[i % palette.length];
      mat.color.setHex(color);
      mat.emissive.setHex(emissive);
    });
  }

  return { skyLanterns, lanternOrigins, setSunsetMode };
}
