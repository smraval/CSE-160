import * as THREE from 'three';

export function initLampPost(scene) {
  const group   = new THREE.Group();
  group.position.set(6.8, 0, 2);

  const ironMat = new THREE.MeshPhongMaterial({ color: 0x2a2a2a, shininess: 80 });

  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.42, 0.18, 16), ironMat);
  base.position.y = 0.09;
  base.castShadow = true;
  group.add(base);

  const poleH = 4.4;
  const pole  = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.075, poleH, 8), ironMat);
  pole.position.y = 0.18 + poleH / 2;
  pole.castShadow = true;
  group.add(pole);

  const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.7, 8), ironMat);
  arm.rotation.z = Math.PI / 2;
  arm.position.set(-0.35, 0.18 + poleH, 0);
  arm.castShadow = true;
  group.add(arm);

  const globe = new THREE.Mesh(
    new THREE.SphereGeometry(0.22, 16, 16),
    new THREE.MeshStandardMaterial({ color: 0xfffbe0, emissive: 0xffe08a, emissiveIntensity: 1.2 })
  );
  globe.position.set(-0.7, 0.18 + poleH, 0);
  group.add(globe);

  const shade = new THREE.Mesh(
    new THREE.ConeGeometry(0.32, 0.22, 16, 1, true),
    new THREE.MeshPhongMaterial({ color: 0x1a1a1a, side: THREE.DoubleSide })
  );
  shade.position.set(-0.7, 0.18 + poleH + 0.22, 0);
  group.add(shade);

  scene.add(group);
}
