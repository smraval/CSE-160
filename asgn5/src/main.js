import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

import { initLights   } from './lights.js';
import { initLampPost  } from './lampPost.js';
import { initLanterns  } from './lanterns.js';
import { initPicnic    } from './picnic.js';
import { initTrees     } from './trees.js';
import { initBench     } from './bench.js';
import { initPath      } from './path.js';
import { initNature    } from './nature.js';
import { initFountain  } from './fountain.js';

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type    = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 8, 20);
camera.lookAt(0, 0, 0);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance   = 3;
controls.maxDistance   = 80;
controls.maxPolarAngle = Math.PI / 2 - 0.02;
controls.target.set(0, 1, 0);
controls.update();

const loader = new THREE.TextureLoader();

function loadTex(path, repeatX = 1, repeatY = 1) {
  const t = loader.load(path);
  t.wrapS = THREE.RepeatWrapping;
  t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeatX, repeatY);
  t.anisotropy = renderer.capabilities.getMaxAnisotropy();
  return t;
}

const grassTex    = loadTex('../img/grass.jpg',          12, 12);
const pathTex     = loadTex('../img/path.jpg',            1,  1);
const blanketTex  = loadTex('../img/picnic_blanket.jpg',  1,  1);
const fountainTex = loadTex('../img/fountain.jpg',        1,  1);

const skyTex    = loader.load('../img/sky.jpg');
const sunsetTex = loader.load('../img/sunset.jpg');
skyTex.wrapS    = THREE.RepeatWrapping;
skyTex.wrapT    = THREE.ClampToEdgeWrapping;
sunsetTex.wrapS = THREE.RepeatWrapping;
sunsetTex.wrapT = THREE.ClampToEdgeWrapping;

const skyMat = new THREE.MeshBasicMaterial({ map: skyTex, side: THREE.BackSide });
scene.add(new THREE.Mesh(new THREE.SphereGeometry(300, 48, 24), skyMat));

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(80, 80),
  new THREE.MeshPhongMaterial({ map: grassTex })
);
ground.rotation.x    = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

const { dirLight, ambientLight, hemiLight, lampLight, spotLight, sunGroup } = initLights(scene);
initLampPost(scene);
const { skyLanterns, lanternOrigins, setSunsetMode } = initLanterns(scene);
initPicnic(scene, loader, blanketTex);
initTrees(scene);
initBench(scene);
initPath(scene, pathTex);
initNature(scene);
const { fountainSpray } = initFountain(scene, fountainTex);

[
  ['cb-dir',   () => { dirLight.visible    = !dirLight.visible;   sunGroup.visible = dirLight.visible; }],
  ['cb-amb',   () => { ambientLight.visible = !ambientLight.visible; }],
  ['cb-hemi',  () => { hemiLight.visible   = !hemiLight.visible;  }],
  ['cb-point', () => { lampLight.visible   = !lampLight.visible;  }],
  ['cb-spot',  () => { spotLight.visible   = !spotLight.visible;  }],
].forEach(([id, fn]) => document.getElementById(id).addEventListener('change', fn));

document.getElementById('cb-sunset').addEventListener('change', (e) => {
  const on = e.target.checked;
  skyMat.map = on ? sunsetTex : skyTex;
  skyMat.needsUpdate = true;
  setSunsetMode(on);
  dirLight.visible  = !on;
  sunGroup.visible  = !on;
  document.getElementById('cb-dir').checked = !on;
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const fpsEl     = document.getElementById('fps-counter');
let   fpsFrames = 0;
let   fpsLast   = performance.now();

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();

  skyLanterns.forEach((lantern, i) => {
    lantern.position.y = lanternOrigins[i].y + Math.sin(t * 0.5 + i * 2.1) * 0.6;
    lantern.position.x = lanternOrigins[i].x + Math.sin(t * 0.3 + i * 1.5) * 0.25;
    lantern.rotation.y = t * 0.35 + i;
  });

  fountainSpray.position.y = 2.1 + Math.abs(Math.sin(t * 2.4)) * 0.9;
  fountainSpray.scale.y    = 0.6 + Math.abs(Math.sin(t * 2.4)) * 0.7;

  controls.update();

  fpsFrames++;
  const now = performance.now();
  if (now - fpsLast >= 1000) {
    fpsEl.textContent = `FPS: ${fpsFrames}`;
    fpsFrames = 0;
    fpsLast   = now;
  }

  renderer.render(scene, camera);
}

animate();
