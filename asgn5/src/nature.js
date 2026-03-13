import * as THREE from 'three';

const stemMat       = new THREE.MeshPhongMaterial({ color: 0x2a7a1a });
const darkGreenMat  = new THREE.MeshPhongMaterial({ color: 0x2d5a1b });
const lightGreenMat = new THREE.MeshPhongMaterial({ color: 0x4a8c2a });

const FLOWERS = [
  [ 2.6, -2.0, 0xff69b4, 0.55, 0.14],
  [-2.7, -1.8, 0xffd700, 0.50, 0.13],
  [ 3.2,  1.2, 0xffffff, 0.58, 0.15],
  [-2.1,  3.0, 0xff4500, 0.52, 0.13],
  [ 1.5,  3.6, 0x9370db, 0.55, 0.14],
  [-3.5,  0.6, 0xff69b4, 0.48, 0.12],
  [ 4.4, -3.0, 0xffd700, 0.55, 0.14],
  [-1.6, -3.4, 0xffffff, 0.50, 0.13],
  [ 4.0,  6.0, 0xff1493, 0.55, 0.14],
  [ 4.2,  3.5, 0xffd700, 0.52, 0.13],
  [ 4.0,  1.0, 0xee82ee, 0.58, 0.14],
  [ 4.1, -2.0, 0xffffff, 0.50, 0.13],
  [ 4.0, -5.5, 0xff69b4, 0.55, 0.14],
  [ 4.2, -8.0, 0xffff00, 0.52, 0.13],
  [ 3.0,-11.0, 0xff69b4, 0.55, 0.14],
  [ 6.5,-11.5, 0x9370db, 0.52, 0.13],
  [ 7.5, -8.0, 0xffffff, 0.58, 0.15],
  [ 3.5, -7.5, 0xffd700, 0.50, 0.13],
  [-5.0,  1.5, 0xff1493, 0.55, 0.14],
  [ 0.0, -4.5, 0xffff00, 0.52, 0.13],
  [-6.0, -2.0, 0xee82ee, 0.58, 0.14],
  [ 6.5,  0.5, 0xffa500, 0.50, 0.13],
  [-7.5,  5.0, 0xff69b4, 0.55, 0.14],
  [ 8.0,  8.0, 0xffd700, 0.52, 0.13],
  [-9.0, -3.0, 0xffffff, 0.55, 0.14],
  [ 9.5,  3.0, 0x9370db, 0.50, 0.13],
  [-4.0,  8.0, 0xff4500, 0.58, 0.15],
  [ 2.0,  9.0, 0xff69b4, 0.52, 0.13],
  [-8.0, -8.0, 0xffff00, 0.55, 0.14],
  [ 11.0,-2.0, 0xee82ee, 0.50, 0.13],
  [-10.0, 7.0, 0xffd700, 0.55, 0.14],
  [ 1.0, -8.0, 0xffffff, 0.52, 0.13],
];

export function initNature(scene) {
  FLOWERS.forEach(([x, z, color, sh, hr]) => makeFlower(scene, x, z, color, sh, hr));
  initBushes(scene);
}

function makeFlower(scene, fx, fz, color, stemH = 0.55, headR = 0.14) {
  const group = new THREE.Group();
  group.position.set(fx, 0, fz);

  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, stemH, 6), stemMat);
  stem.position.y = stemH / 2;
  group.add(stem);

  const head = new THREE.Mesh(
    new THREE.SphereGeometry(headR, 8, 6),
    new THREE.MeshPhongMaterial({ color })
  );
  head.position.y = stemH + headR * 0.8;
  group.add(head);

  scene.add(group);
}

function initBushes(scene) {
  [
    [-12.0,  0.0, 1.1, darkGreenMat ],
    [ 12.0,  2.0, 1.0, darkGreenMat ],
    [-11.0, -5.0, 0.9, lightGreenMat],
    [  3.5,-12.0, 1.0, lightGreenMat],
    [ -3.0,-12.0, 0.9, darkGreenMat ],
    [  8.0,  6.0, 0.85,lightGreenMat],
    [ -7.0,  7.0, 0.9, darkGreenMat ],
    [  6.0,-10.0, 0.8, lightGreenMat],
  ].forEach(([x, z, r, mat]) => {
    const bush = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 8), mat);
    bush.position.set(x, r * 0.55, z);
    bush.castShadow = true;
    scene.add(bush);
  });
}
