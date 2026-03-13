import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { addMesh }   from './utils.js';

export function initPicnic(scene, loader, blanketTex) {
  addMesh(
    scene,
    new THREE.BoxGeometry(4.5, 0.05, 4.2),
    new THREE.MeshPhongMaterial({ map: blanketTex }),
    { x: 0, y: 0.025, z: 0.5 }
  );

  const basketMat    = new THREE.MeshPhongMaterial({ color: 0x8b5a2b });
  const basketLidMat = new THREE.MeshPhongMaterial({ color: 0x6b3f1a });

  addMesh(scene, new THREE.BoxGeometry(0.9, 0.5, 0.65), basketMat, { x: -1.0, y: 0.30, z: -0.5 });
  const lid = addMesh(scene, new THREE.BoxGeometry(0.9, 0.1, 0.65), basketLidMat, { x: -1.0, y: 0.62, z: -0.5 });
  lid.rotation.x = -0.35;

  addMesh(
    scene,
    new THREE.TorusGeometry(0.28, 0.04, 8, 16, Math.PI),
    basketMat,
    { x: -1.0, y: 0.72, z: -0.5, rx: -Math.PI / 2 }
  );

  addMesh(scene, new THREE.SphereGeometry(0.13, 16, 16),
    new THREE.MeshPhongMaterial({ color: 0xdd2222 }), { x: 0.3, y: 0.17, z: 0.2 });
  addMesh(scene, new THREE.SphereGeometry(0.12, 16, 16),
    new THREE.MeshPhongMaterial({ color: 0xff8800 }), { x: 0.55, y: 0.16, z: 0.4 });

  const plateMat = new THREE.MeshPhongMaterial({ color: 0xf5f5f5 });

  addMesh(scene, new THREE.CylinderGeometry(0.3, 0.3, 0.03, 20), plateMat, { x: 0.8, y: 0.065, z: -0.2 });
  addMesh(scene, new THREE.BoxGeometry(0.38, 0.07, 0.32),
    new THREE.MeshPhongMaterial({ color: 0xd4a55c }), { x: 0.8, y: 0.115, z: -0.2 });

  addMesh(scene, new THREE.CylinderGeometry(0.28, 0.28, 0.03, 20), plateMat, { x: -0.2, y: 0.065, z: 0.7 });
  addMesh(scene, new THREE.SphereGeometry(0.1, 12, 12),
    new THREE.MeshPhongMaterial({ color: 0xee3344 }), { x: -0.2, y: 0.15, z: 0.7 });

  addMesh(scene, new THREE.CylinderGeometry(0.09, 0.07, 0.26, 12),
    new THREE.MeshPhongMaterial({ color: 0xffd060, transparent: true, opacity: 0.82 }),
    { x: 1.0, y: 0.18, z: 0.6 });

  addMesh(scene, new THREE.SphereGeometry(0.16, 12, 8),
    new THREE.MeshPhongMaterial({ color: 0xfaf0f0 }), { x: -0.5, y: 0.22, z: -0.9 });
  addMesh(scene, new THREE.CylinderGeometry(0.1, 0.12, 0.14, 10),
    new THREE.MeshPhongMaterial({ color: 0xfaf0f0 }), { x: -0.5, y: 0.12, z: -0.9 });

  const mtlLoader = new MTLLoader();
  mtlLoader.setPath('../obj/');
  mtlLoader.load('burger_colored.obj.mtl', (materials) => {
    materials.preload();
    const burgerLoader = new OBJLoader();
    burgerLoader.setMaterials(materials);
    burgerLoader.setPath('../obj/');
    burgerLoader.load('burger_colored.obj', (burger) => {
      burger.traverse((child) => {
        if (child.isMesh) {
          child.castShadow    = true;
          child.receiveShadow = true;
        }
      });
      burger.scale.set(0.3, 0.3, 0.3);
      burger.position.set(-1.0, 0, 0.6);
      scene.add(burger);
    });
  });
}
