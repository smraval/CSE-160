import * as THREE from 'three';

export function initLights(scene) {
  const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
  dirLight.position.set(10, 20, 10);
  dirLight.castShadow = true;
  dirLight.shadow.mapSize.width  = 2048;
  dirLight.shadow.mapSize.height = 2048;
  dirLight.shadow.camera.near   = 0.5;
  dirLight.shadow.camera.far    = 100;
  dirLight.shadow.camera.left   = -30;
  dirLight.shadow.camera.right  =  30;
  dirLight.shadow.camera.top    =  30;
  dirLight.shadow.camera.bottom = -30;
  scene.add(dirLight);

  const sunGroup = new THREE.Group();
  sunGroup.position.copy(dirLight.position);
  sunGroup.add(new THREE.Mesh(
    new THREE.SphereGeometry(1.4, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0xffe840 })
  ));
  sunGroup.add(new THREE.Mesh(
    new THREE.SphereGeometry(2.0, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0xffcc00, transparent: true, opacity: 0.25 })
  ));
  scene.add(sunGroup);

  const ambientLight = new THREE.AmbientLight(0xfff8e7, 0.5);
  scene.add(ambientLight);

  const hemiLight = new THREE.HemisphereLight(0x87ceeb, 0x4a7a2a, 0.6);
  scene.add(hemiLight);

  const lampLight = new THREE.PointLight(0xffe08a, 2, 18, 2);
  lampLight.position.set(6.8, 4.5, 2);
  lampLight.castShadow = true;
  scene.add(lampLight);

  const spotLight = new THREE.SpotLight(0xfff5cc, 1.2, 30, Math.PI / 7, 0.4, 1.5);
  spotLight.position.set(0, 14, 2);
  spotLight.target.position.set(0, 0, 0);
  spotLight.castShadow = true;
  scene.add(spotLight);
  scene.add(spotLight.target);

  return { dirLight, ambientLight, hemiLight, lampLight, spotLight, sunGroup };
}
