import * as THREE from 'three';

export function initFountain(scene, fountainTex) {
  const stoneMat = new THREE.MeshPhongMaterial({ map: fountainTex, shininess: 35 });
  const waterSprayMat = new THREE.MeshPhongMaterial({
    color: 0xaaddff,
    transparent: true,
    opacity: 0.70,
    shininess: 80,
  });

  const group = new THREE.Group();
  group.position.set(5, 0, -9);

  const lowerRim = new THREE.Mesh(new THREE.TorusGeometry(1.7, 0.2, 10, 40), stoneMat);
  lowerRim.rotation.x = Math.PI / 2;
  lowerRim.position.y = 0.26;
  lowerRim.castShadow = true;
  group.add(lowerRim);

  const lowerFloor = new THREE.Mesh(new THREE.CylinderGeometry(1.68, 1.68, 0.12, 40), stoneMat);
  lowerFloor.position.y = 0.06;
  lowerFloor.castShadow = true;
  group.add(lowerFloor);

  const column = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.26, 1.5, 16), stoneMat);
  column.position.y = 0.87;
  column.castShadow = true;
  group.add(column);

  const upperRim = new THREE.Mesh(new THREE.TorusGeometry(0.7, 0.14, 8, 32), stoneMat);
  upperRim.rotation.x = Math.PI / 2;
  upperRim.position.y = 1.72;
  upperRim.castShadow = true;
  group.add(upperRim);

  const upperFloor = new THREE.Mesh(new THREE.CylinderGeometry(0.68, 0.68, 0.1, 32), stoneMat);
  upperFloor.position.y = 1.57;
  upperFloor.castShadow = true;
  group.add(upperFloor);

  const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.08, 0.18, 10), stoneMat);
  nozzle.position.y = 1.88;
  group.add(nozzle);

  const fountainSpray = new THREE.Mesh(new THREE.SphereGeometry(0.16, 12, 8), waterSprayMat);
  fountainSpray.position.y = 2.1;
  group.add(fountainSpray);

  scene.add(group);
  return { fountainSpray };
}
