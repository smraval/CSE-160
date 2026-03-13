import * as THREE from 'three';

export function initBench(scene) {
  const woodMat  = new THREE.MeshPhongMaterial({ color: 0xc8874a, shininess: 30 });
  const metalMat = new THREE.MeshPhongMaterial({ color: 0x444444, shininess: 60 });

  const group = new THREE.Group();
  group.position.set(7.5, 0, 4);
  group.rotation.y = 0;

  const seat = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.1, 0.55), woodMat);
  seat.position.y = 0.85;
  seat.castShadow = true;
  group.add(seat);

  const back = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.52, 0.08), woodMat);
  back.position.set(0, 1.2, -0.23);
  back.rotation.x = -0.1;
  back.castShadow = true;
  group.add(back);

  [[-1.0, 0.2], [-1.0, -0.2], [1.0, 0.2], [1.0, -0.2]].forEach(([lx, lz]) => {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.85, 0.1), metalMat);
    leg.position.set(lx, 0.425, lz);
    leg.castShadow = true;
    group.add(leg);
  });

  scene.add(group);
}
