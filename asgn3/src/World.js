// world.js

// vertex shader 
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  attribute vec2 a_TexCoord;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  varying vec2 v_TexCoord;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;
    v_TexCoord = a_TexCoord;
  }
`;

// fragment shader 
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler;
  uniform float u_texColorWeight;
  varying vec2 v_TexCoord;
  void main() {
    vec4 texColor = texture2D(u_Sampler, v_TexCoord);
    gl_FragColor = mix(u_FragColor, texColor, u_texColorWeight);
  }
`;

// GLOBAL VARS
let canvas;
let gl;

// attribute locations
let a_Position;
let a_TexCoord;

// uniform locations
let u_FragColor;
let u_ModelMatrix;
let u_ViewMatrix;
let u_ProjectionMatrix;
let u_Sampler;
let u_texColorWeight;

// scene objects
let camera;
let g_walls  = [];
let g_ground = null;
let g_sky    = null;

let g_wallTexture   = null;
let g_groundTexture = null;

let g_keys = {};

let g_mouseDown  = false;
let g_lastMouseX = 0;
let g_lastMouseY = 0;
let g_dragTotal  = 0; 

let g_neutralCamera = false;

// performance
let g_frameCount = 0;
let g_lastFpsUpdate = performance.now();
let g_fps = 0;

// map dimensions and varying walls and stuff -- kind of trial and error process not much logic happening here
function createMap() {
  let map = [];
  for (let z = 0; z < 32; z++) {
    map[z] = new Array(32).fill(0);
  }

  for (let i = 0; i < 32; i++) {
    map[0][i]  = 3;
    map[31][i] = 3;
    map[i][0]  = 3;
    map[i][31] = 3;
  }

  let corners = [[0,0],[0,30],[0,31],[1,0],[1,31],
                 [30,0],[30,31],[31,0],[31,30],[31,31]];
  for (let [cz, cx] of corners) { map[cz][cx] = 4; }

  for (let x = 3; x <= 9; x++) {
    map[3][x] = (x === 3 || x === 9) ? 3 : 2;
    map[9][x] = (x === 3 || x === 9) ? 3 : 2;
  }
  for (let z = 3; z <= 9; z++) {
    map[z][3] = (z === 3 || z === 9) ? 3 : 2;
    map[z][9] = (z === 3 || z === 9) ? 3 : 2;
  }
  map[9][6] = 0; map[9][7] = 0; 
  map[4][5] = 2; map[4][7] = 2;
  map[8][5] = 2; map[8][7] = 2;

  for (let x = 22; x <= 28; x++) {
    map[3][x] = (x === 22 || x === 28) ? 3 : 2;
    map[9][x] = (x === 22 || x === 28) ? 3 : 2;
  }
  for (let z = 3; z <= 9; z++) {
    map[z][22] = (z === 3 || z === 9) ? 3 : 2;
    map[z][28] = (z === 3 || z === 9) ? 3 : 2;
  }
  map[9][25] = 0; map[9][26] = 0; 
  map[4][23] = 2; map[4][27] = 2;
  map[8][23] = 2; map[8][27] = 2;

  let pillars = [[13,9],[13,21],[18,9],[18,21]];
  for (let [pz, px] of pillars) {
    map[pz][px]   = 4; map[pz][px+1]   = 4;
    map[pz+1][px] = 4; map[pz+1][px+1] = 4;
  }

  for (let x = 1; x <= 30; x++) {
    if ((x >= 8 && x <= 10) || (x >= 21 && x <= 23)) continue;
    let h = (x % 3 === 0) ? 3 : 2;
    map[15][x] = h;
    map[16][x] = h;
  }

  for (let x = 12; x <= 19; x++) {
    map[22][x] = (x === 12 || x === 19) ? 3 : 2;
    map[28][x] = (x === 12 || x === 19) ? 3 : 2;
  }
  for (let z = 22; z <= 28; z++) {
    map[z][12] = (z === 22 || z === 28) ? 3 : 2;
    map[z][19] = (z === 22 || z === 28) ? 3 : 2;
  }
  map[22][15] = 0; map[22][16] = 0;
  for (let x = 14; x <= 17; x++) map[25][x] = 1;

  for (let x = 5; x <= 11; x++) {
    map[20][x] = (x === 8) ? 2 : 1;
    map[21][x] = (x === 8) ? 2 : 1;
  }
  for (let x = 20; x <= 26; x++) {
    map[20][x] = (x === 23) ? 2 : 1;
    map[21][x] = (x === 23) ? 2 : 1;
  }

  for (let x = 13; x <= 18; x++) { map[12][x] = 1; }
  for (let x = 13; x <= 18; x++) { map[19][x] = 1; }

  for (let i = 0; i < 4; i++) {
    map[11][i + 1] = i + 1; 
    map[11][30 - i] = i + 1; 
  }

  for (let x = 11; x <= 20; x++) {
    if (map[13][x] === 0) map[13][x] = 3;
    if (map[18][x] === 0) map[18][x] = 3;
  }

  for (let x = 2; x <= 10; x++)  { map[29][x] = (x % 2 === 0) ? 2 : 1; }
  for (let x = 21; x <= 29; x++) { map[29][x] = (x % 2 === 0) ? 2 : 1; }

  for (let [az, ax] of [[5,17],[5,14],[10,5],[10,26],[28,5],[28,26],[17,5],[17,26]]) {
    if (map[az][ax] === 0) map[az][ax] = 3;
  }

  return map;
}

var g_map = createMap();

// WEBGL
function setupWebGL() {
  canvas = document.getElementById('webgl');
  if (!canvas) { console.error('Failed to get canvas element'); return; }

  gl = canvas.getContext('webgl', { preserveDrawingBuffer: true });
  if (!gl) { console.error('Failed to get WebGL context'); return; }

  gl.enable(gl.DEPTH_TEST);
  gl.clearColor(0.53, 0.81, 0.98, 1.0);
}

function connectVariablesToGLSL() {
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to initialize shaders'); return false;
  }

  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) { console.log('Failed to get a_Position'); return false; }

  a_TexCoord = gl.getAttribLocation(gl.program, 'a_TexCoord');
  if (a_TexCoord < 0) { console.log('Failed to get a_TexCoord'); return false; }

  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) { console.log('Failed to get u_FragColor'); return false; }

  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) { console.log('Failed to get u_ModelMatrix'); return false; }

  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) { console.log('Failed to get u_ViewMatrix'); return false; }

  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix) { console.log('Failed to get u_ProjectionMatrix'); return false; }

  u_Sampler = gl.getUniformLocation(gl.program, 'u_Sampler');
  if (u_Sampler === null) { console.log('Failed to get u_Sampler'); return false; }

  u_texColorWeight = gl.getUniformLocation(gl.program, 'u_texColorWeight');
  if (u_texColorWeight === null) { console.log('Failed to get u_texColorWeight'); return false; }

  return true;
}

// TEXTURES
function isPowerOf2(v) { return (v & (v - 1)) === 0; }

function loadTexture(image) {
  let texture = gl.createTexture();
  if (!texture) { console.log('Failed to create texture object'); return null; }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.bindTexture(gl.TEXTURE_2D, texture);

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);

  if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
  } else {
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    console.warn('Texture ' + image.width + 'x' + image.height +
      ' is not power-of-2 — tiling disabled. Resize to 256x256 or 512x512 for best results.');
  }
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  return texture;
}

function initTextures(onAllLoaded) {
  let remaining = 2;

  function onOne() {
    remaining--;
    if (remaining === 0) onAllLoaded();
  }

  let wallImg = new Image();
  wallImg.onload  = function() { g_wallTexture   = loadTexture(wallImg);   onOne(); };
  wallImg.onerror = function() { console.error('Failed to load wall.jpg');  onOne(); };
  wallImg.src = '../img/wall.jpg';

  let groundImg = new Image();
  groundImg.onload  = function() { g_groundTexture = loadTexture(groundImg); onOne(); };
  groundImg.onerror = function() { console.error('Failed to load ground.jpg'); onOne(); };
  groundImg.src = '../img/ground.jpg';
}

function bindTexture(texture) {
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.uniform1i(u_Sampler, 0);
}

function buildWorld() {
  g_sky = new Cube();
  g_sky.color = [0.53, 0.81, 0.98, 1.0];
  g_sky.textureWeight = 0.0;
  g_sky.matrix.setTranslate(-500, -500, -500);
  g_sky.matrix.scale(1000, 1000, 1000);

  g_ground = new Cube();
  g_ground.color = [0.22, 0.55, 0.15, 1.0];
  g_ground.textureWeight = 1.0;
  g_ground.matrix.setTranslate(-1, -0.1, -1);
  g_ground.matrix.scale(34, 0.1, 34);


  g_walls = [];
  for (let z = 0; z < g_map.length; z++) {
    for (let x = 0; x < g_map[z].length; x++) {
      let h = g_map[z][x];
      for (let y = 0; y < h; y++) {
        let w = new Cube();
        w.color = [0.75, 0.45, 0.28, 1.0]; 
        w.textureWeight = 1.0;
        w.matrix.setTranslate(x, y, z);
        g_walls.push(w);
      }
    }
  }
}

function renderScene() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.uniformMatrix4fv(u_ViewMatrix,       false, camera.viewMatrix.elements);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, camera.projectionMatrix.elements);

  if (g_wallTexture) bindTexture(g_wallTexture);
  g_sky.render();

  if (g_groundTexture) bindTexture(g_groundTexture);
  g_ground.render();

  if (g_wallTexture) bindTexture(g_wallTexture);
  for (let w of g_walls) {
    w.render();
  }

  drawAllCrabs();
}

function handleKeys() {
  if (g_keys['w'] || g_keys['W']) camera.moveForward();
  if (g_keys['s'] || g_keys['S']) camera.moveBackwards();
  if (g_keys['a'] || g_keys['A']) camera.moveLeft();
  if (g_keys['d'] || g_keys['D']) camera.moveRight();
  if (g_keys['ArrowLeft']  || g_keys['q'] || g_keys['Q']) camera.panLeft();
  if (g_keys['ArrowRight'] || g_keys['e'] || g_keys['E']) camera.panRight();
}

// minecraft functionality 
function getBlockInFront() {
  let f = new Vector3();
  f.set(camera.at);
  f.sub(camera.eye);
  f.normalize();
  f.mul(2.0);

  let tx = Math.floor(camera.eye.elements[0] + f.elements[0]);
  let tz = Math.floor(camera.eye.elements[2] + f.elements[2]);
  tx = Math.max(0, Math.min(31, tx));
  tz = Math.max(0, Math.min(31, tz));
  return { x: tx, z: tz };
}

function addBlock() {
  let cell = getBlockInFront();
  let h = g_map[cell.z][cell.x];
  if (h >= 4) return;

  g_map[cell.z][cell.x]++;
  let w = new Cube();
  w.color = [0.75, 0.45, 0.28, 1.0];
  w.textureWeight = 1.0;
  w.matrix.setTranslate(cell.x, h, cell.z);
  g_walls.push(w);
}

function deleteBlock() {
  let cell = getBlockInFront();
  let h = g_map[cell.z][cell.x];
  if (h <= 0) return;
  g_map[cell.z][cell.x]--;
  for (let i = g_walls.length - 1; i >= 0; i--) {
    let e = g_walls[i].matrix.elements;
    if (Math.round(e[12]) === cell.x &&
        Math.round(e[13]) === h - 1 &&
        Math.round(e[14]) === cell.z) {
      g_walls.splice(i, 1);
      break;
    }
  }
}

// aaaanimation
function tick() {
  let now = performance.now();
  g_frameCount++;
  if (now - g_lastFpsUpdate >= 500) {
    g_fps = Math.round((g_frameCount / (now - g_lastFpsUpdate)) * 1000);
    let el = document.getElementById('fpsValue');
    if (el) el.innerText = g_fps;
    g_frameCount = 0;
    g_lastFpsUpdate = now;
  }

  handleKeys();
  renderScene();
  requestAnimationFrame(tick);
}

function main() {
  setupWebGL();
  if (!gl) { console.error('Failed to setup WebGL'); return; }

  if (!connectVariablesToGLSL()) {
    console.error('Failed to connect variables to GLSL'); return;
  }

  initPersistentBuffers();
  camera = new Camera();
  camera.eye = new Vector3([5, 1.5, 5]);
  camera.at  = new Vector3([5, 1.5, 6]);
  camera.updateViewMatrix();

  document.addEventListener('keydown', function(e) {
    g_keys[e.key] = true;
    e.preventDefault();
  });
  document.addEventListener('keyup', function(e) {
    g_keys[e.key] = false;
  });

  // camera rotate 
  canvas.addEventListener('mousedown', function(e) {
    if (e.button !== 0) return;
    g_mouseDown  = true;
    g_lastMouseX = e.clientX;
    g_lastMouseY = e.clientY;
    g_dragTotal  = 0;
  });

  canvas.addEventListener('mousemove', function(e) {
    if (!g_mouseDown) return;
    let dx = e.clientX - g_lastMouseX;
    let dy = e.clientY - g_lastMouseY;
    g_dragTotal += Math.abs(dx) + Math.abs(dy);
    camera.panByDelta(dx, g_neutralCamera ? 0 : dy);
    g_lastMouseX = e.clientX;
    g_lastMouseY = e.clientY;
  });

  canvas.addEventListener('mouseup', function(e) {
    if (e.button !== 0) return;
    if (g_dragTotal < 5) {
      if (e.shiftKey) {
        tryCatchCrab(); 
      } else {
        addBlock();    
      }
    }
    g_mouseDown = false;
  });

  // neutral-camera checkbox
  document.getElementById('neutralCamera').addEventListener('change', function() {
    g_neutralCamera = this.checked;
    if (g_neutralCamera) {
      camera.at.elements[1] = camera.eye.elements[1];
      camera.updateViewMatrix();
    }
  });

  canvas.addEventListener('contextmenu', function(e) {
    e.preventDefault();
    deleteBlock();
  });

  buildWorld();

  initTextures(function() {
    tick();
  });
}
