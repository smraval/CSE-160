import * as THREE from 'three';

export function initPath(scene, pathTex) {
  const mat = new THREE.MeshPhongMaterial({ map: pathTex, shininess: 20 });

  for (let z = -12; z <= 8; z += 1.35) {
    const side   = (Math.round(z) % 2 === 0) ? 1 : -1;
    const offset = side * 0.08;
    const slab   = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.1, 1.1), mat);
    slab.position.set(5 + offset, 0.05, z);
    slab.rotation.y  = offset * 0.18;
    slab.receiveShadow = true;
    scene.add(slab);
  }
}
