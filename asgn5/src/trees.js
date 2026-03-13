import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';

const trunkMat   = new THREE.MeshPhongMaterial({ color: 0x6b3a2a });
const blossomMat = new THREE.MeshPhongMaterial({ color: 0xffb6d9 });

const OBJ_TREE_PLACEMENTS = [
  [ -9,  -6, 0,           0.60],
  [  9,  -6, Math.PI / 4, 0.60],
  [-30,  18, 0.8,         0.65],
  [ 28, -22, 2.0,         0.58],
  [-20, -28, 1.3,         0.62],
  [ 32,   8, 0.4,         0.60],
  [ 16,  26, 1.7,         0.55],
  [-34,  -8, 2.4,         0.63],
  [ 26, -35, 0.9,         0.60],
  [-18,  32, 1.1,         0.58],
  [ 36,  22, 1.9,         0.62],
  [-28, -35, 0.5,         0.65],
];

export function initTrees(scene) {
  const mtlLoader = new MTLLoader();
  mtlLoader.setPath('../obj/');
  mtlLoader.load('Lowpoly_tree_sample.mtl', (materials) => {
    materials.preload();
    const objLoader = new OBJLoader();
    objLoader.setMaterials(materials);
    objLoader.setPath('../obj/');
    objLoader.load('Lowpoly_tree_sample.obj', (baseTree) => {
      baseTree.traverse((c) => {
        if (c.isMesh) { c.castShadow = true; c.receiveShadow = true; }
      });
      OBJ_TREE_PLACEMENTS.forEach(([x, z, ry, s], i) => {
        const t = i === 0 ? baseTree : baseTree.clone();
        t.scale.set(s, s, s);
        t.position.set(x, 0, z);
        t.rotation.y = ry;
        scene.add(t);
      });
    });
  });

  [
    [  -5,  -4,  0            ],
    [   8,  -5,  Math.PI / 5  ],
    [ -10,   2, -Math.PI / 8  ],
    [  10,  -1,  Math.PI / 3  ],
    [ -22,  12,  0.6          ],
    [  20, -18,  1.9          ],
    [ -15, -20,  1.1          ],
    [  25,   5,  2.3          ],
    [  12,  20,  0.3          ],
    [ -25,  -2,  1.5          ],
    [  18,  30,  0.8          ],
    [ -12, -30,  2.0          ],
    [  30, -15,  1.3          ],
    [ -32,  20,  0.4          ],
    [   5,  28,  1.7          ],
    [ -20,  28,  2.5          ],
  ].forEach(([tx, tz, ry]) => makeCherryTree(scene, tx, tz, ry));
}

function makeCherryTree(scene, tx, tz, ry = 0) {
  const group = new THREE.Group();
  group.position.set(tx, 0, tz);
  group.rotation.y = ry;

  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.22, 3.6, 8), trunkMat);
  trunk.position.y = 1.8;
  trunk.castShadow = true;
  group.add(trunk);

  [
    [ 0.0, 4.3,  0.0, 1.6],
    [-0.9, 3.8,  0.3, 1.2],
    [ 0.9, 3.7, -0.2, 1.2],
    [ 0.2, 4.9,  0.4, 1.0],
    [-0.4, 4.5, -0.5, 1.0],
  ].forEach(([cx, cy, cz, r]) => {
    const blossom = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 8), blossomMat);
    blossom.position.set(cx, cy, cz);
    blossom.castShadow = true;
    group.add(blossom);
  });

  scene.add(group);
}
