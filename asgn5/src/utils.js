import * as THREE from 'three';

export function addMesh(scene, geo, mat, opts = {}) {
  const { x=0, y=0, z=0, rx=0, ry=0, rz=0, sx=1, sy=1, sz=1, shadow=true } = opts;
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  m.rotation.set(rx, ry, rz);
  m.scale.set(sx, sy, sz);
  if (shadow) { m.castShadow = true; m.receiveShadow = true; }
  scene.add(m);
  return m;
}
