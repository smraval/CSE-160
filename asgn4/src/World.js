// world.js
// vertex shader 
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  attribute vec2 a_TexCoord;
  attribute vec3 a_Normal;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  uniform vec3 u_LightPos;
  varying vec2 v_TexCoord;
  varying vec3 v_NormalDir;
  varying vec3 v_LightDir;
  varying vec3 v_WorldPos;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;
    v_TexCoord  = a_TexCoord;

    vec4 worldPos    = u_ModelMatrix * a_Position;
    v_WorldPos       = worldPos.xyz;
    v_LightDir       = normalize(u_LightPos - worldPos.xyz);

    // mat3(u_ModelMatrix) is equivalent to the full normal matrix for our scene
    // (objects use only translations/axis-aligned scales — avoids transpose()/inverse()
    // which are GLSL ES 3.00 only and not guaranteed in WebGL 1.0)
    v_NormalDir      = normalize(mat3(u_ModelMatrix) * a_Normal);
  }
`;

// fragment shader 
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4  u_FragColor;
  uniform sampler2D u_Sampler;
  uniform float u_texColorWeight;
  uniform float u_ShowNormals;
  uniform vec3  u_CameraPos;

  // point light (light 1)
  uniform vec3  u_LightColor;
  uniform float u_LightOn;

  // spotlight (light 2)
  uniform vec3  u_SpotPos;
  uniform vec3  u_SpotDir;
  uniform float u_SpotCutoff;   
  uniform vec3  u_SpotColor;
  uniform float u_SpotOn;

  varying vec2  v_TexCoord;
  varying vec3  v_NormalDir;
  varying vec3  v_LightDir;
  varying vec3  v_WorldPos;

  vec3 phongContrib(vec3 N, vec3 L, vec3 V, vec3 baseRgb, vec3 lightCol) {
    vec3 H       = normalize(L + V);
    float nDotL  = max(0.0, dot(N, L));
    float spec   = pow(max(0.0, dot(N, H)), 32.0);
    vec3 diffuse  = 0.8 * nDotL * baseRgb * lightCol;
    vec3 specular = 0.5 * spec  * lightCol;
    return diffuse + specular;
  }

  void main() {
    if (u_ShowNormals > 0.5) {
      gl_FragColor = vec4(v_NormalDir, 1.0);
    } else {
      vec4 texColor  = texture2D(u_Sampler, v_TexCoord);
      vec4 baseColor = mix(u_FragColor, texColor, u_texColorWeight);

      if (u_LightOn < 0.5 && u_SpotOn < 0.5) {
        gl_FragColor = baseColor;
      } else {
        vec3 N = normalize(v_NormalDir);
        vec3 V = normalize(u_CameraPos - v_WorldPos);

        // shared ambient (only once regardless of how many lights are on)
        vec3 color = 0.2 * baseColor.rgb;

        // point light contribution
        if (u_LightOn > 0.5) {
          vec3 L = normalize(v_LightDir);
          color += phongContrib(N, L, V, baseColor.rgb, u_LightColor);
        }

        // spotlight contribution
        if (u_SpotOn > 0.5) {
          vec3 L2       = normalize(u_SpotPos - v_WorldPos);
          vec3 spotDir  = normalize(-u_SpotDir);     
          float cosAngle = dot(L2, spotDir);
          if (cosAngle > u_SpotCutoff) {
            // inside the cone — smooth edge falloff
            float intensity = smoothstep(u_SpotCutoff, u_SpotCutoff + 0.05, cosAngle);
            color += intensity * phongContrib(N, L2, V, baseColor.rgb, u_SpotColor);
          }
        }

        gl_FragColor = vec4(clamp(color, 0.0, 1.0), baseColor.a);
      }
    }
  }
`;

// GLOBAL VARS
let canvas;
let gl;

// attribute locations
let a_Position;
let a_TexCoord;
let a_Normal;

// uniform locations
let u_FragColor;
let u_ModelMatrix;
let u_ViewMatrix;
let u_ProjectionMatrix;
let u_Sampler;
let u_texColorWeight;
let u_ShowNormals;
let u_CameraPos;
let u_LightColor;
let u_LightOn;

// lighting state
let g_showNormals  = false;
let g_lightOn      = true;
let g_lightColor   = [1.0, 1.0, 1.0]; 

// spotlight 
let u_SpotPos;
let u_SpotDir;
let u_SpotCutoff;
let u_SpotColor;
let u_SpotOn;
let g_spotOn = true;
let g_spotPos = [16, 8, 16];      
let g_spotDir = [0, -1, 0];      
let g_spotColor = [0.8, 0.5, 1.0]; 
let g_spotCutoff = Math.cos(20 * Math.PI / 180); 

// point light
let u_LightPos;
let g_lightPos   = [16, 6, 16];
let g_lightAngle = 0;
let g_lightCube  = null;
let g_spotCube   = null;

// scene objects
let camera;
let g_walls  = [];
let g_ground = null;
let g_sky    = null;
let g_spheres = [];
let g_model  = null;

let g_wallTexture   = null;
let g_groundTexture = null;

let g_keys = {};

let g_mouseDown  = false;
let g_lastMouseX = 0;
let g_lastMouseY = 0;
let g_dragTotal  = 0; 

let g_neutralCamera = true;

// performance
let g_frameCount = 0;
let g_lastFpsUpdate = performance.now();
let g_fps = 0;

function createMap() {
  let map = [];
  for (let z = 0; z < 32; z++) {
    map[z] = new Array(32).fill(0);
  }
  for (let i = 0; i < 32; i++) {
    map[0][i]  = 5;
    map[31][i] = 5;
    map[i][0]  = 5;
    map[i][31] = 5;
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

  a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
  if (a_Normal < 0) { console.log('Failed to get a_Normal'); return false; }

  u_ShowNormals = gl.getUniformLocation(gl.program, 'u_ShowNormals');
  if (u_ShowNormals === null) { console.log('Failed to get u_ShowNormals'); return false; }

  u_LightPos = gl.getUniformLocation(gl.program, 'u_LightPos');
  if (!u_LightPos) { console.log('Failed to get u_LightPos'); return false; }

  u_CameraPos = gl.getUniformLocation(gl.program, 'u_CameraPos');
  if (!u_CameraPos) { console.log('Failed to get u_CameraPos'); return false; }

  u_LightColor = gl.getUniformLocation(gl.program, 'u_LightColor');
  if (!u_LightColor) { console.log('Failed to get u_LightColor'); return false; }

  u_LightOn = gl.getUniformLocation(gl.program, 'u_LightOn');
  if (!u_LightOn) { console.log('Failed to get u_LightOn'); return false; }

  u_SpotPos     = gl.getUniformLocation(gl.program, 'u_SpotPos');
  u_SpotDir     = gl.getUniformLocation(gl.program, 'u_SpotDir');
  u_SpotCutoff  = gl.getUniformLocation(gl.program, 'u_SpotCutoff');
  u_SpotColor   = gl.getUniformLocation(gl.program, 'u_SpotColor');
  u_SpotOn      = gl.getUniformLocation(gl.program, 'u_SpotOn');

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

function updateLightPos() {
  var cx = 16, cz = 16, radius = 8;
  g_lightPos[0] = cx + radius * Math.cos(g_lightAngle);
  g_lightPos[1] = 6 + 2 * Math.sin(g_lightAngle * 0.7);
  g_lightPos[2] = cz + radius * Math.sin(g_lightAngle);
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

  g_lightCube = new Cube();
  g_lightCube.color = [1.0, 0.95, 0.2, 1.0];
  g_lightCube.textureWeight = 0.0;

  // spotlight marker cube 
  g_spotCube = new Cube();
  g_spotCube.color = [0.8, 0.5, 1.0, 1.0];
  g_spotCube.textureWeight = 0.0;


  g_spheres = [];
  let s1 = new Sphere();
  s1.color = [1.0, 0.55, 0.75, 1.0];
  s1.matrix.setTranslate(15, 1, 15);  
  g_spheres.push(s1);

  // OBJ model 
  g_model = new Model();
  g_model.color = [0.85, 0.55, 0.22, 1.0]; 
  g_model.matrix.setTranslate(12, 0, 17);
  g_model.matrix.scale(1.5, 1.5, 1.5);
  g_model.load('../obj/burger.obj');
}

function renderScene() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.uniformMatrix4fv(u_ViewMatrix,       false, camera.viewMatrix.elements);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, camera.projectionMatrix.elements);
  gl.uniform1f(u_ShowNormals, g_showNormals ? 1.0 : 0.0);
  gl.uniform1f(u_LightOn,     g_lightOn    ? 1.0 : 0.0);
  gl.uniform3fv(u_LightPos,   g_lightPos);
  gl.uniform3fv(u_CameraPos,  camera.eye.elements);
  gl.uniform3fv(u_LightColor, g_lightColor);

  gl.uniform1f(u_SpotOn,     g_spotOn    ? 1.0 : 0.0);
  gl.uniform3fv(u_SpotPos,   g_spotPos);
  gl.uniform3fv(u_SpotDir,   g_spotDir);
  gl.uniform1f(u_SpotCutoff, g_spotCutoff);
  gl.uniform3fv(u_SpotColor, g_spotColor);

  // render point light marker 
  var lp = g_lightPos, s = 0.35;
  g_lightCube.matrix.setTranslate(lp[0] - s/2, lp[1] - s/2, lp[2] - s/2);
  g_lightCube.matrix.scale(s, s, s);
  g_lightCube.render();

  // render spotlight marker 
  var sp = g_spotPos;
  g_spotCube.matrix.setTranslate(sp[0] - s/2, sp[1] - s/2, sp[2] - s/2);
  g_spotCube.matrix.scale(s, s, s);
  g_spotCube.render();
  gl.uniform1f(u_LightOn, 0.0);
  if (g_wallTexture) bindTexture(g_wallTexture);
  g_sky.render();
  gl.uniform1f(u_LightOn, g_lightOn ? 1.0 : 0.0); 

  if (g_groundTexture) bindTexture(g_groundTexture);
  g_ground.render();

  if (g_wallTexture) bindTexture(g_wallTexture);
  for (let w of g_walls) {
    w.render();
  }

  // spheres 
  for (let s of g_spheres) {
    s.render();
  }
  gl.uniform1f(u_texColorWeight, 0.0);
  drawCrabAt(18.5, 0.55, 15, 1.8);

  // OBJ model 
  if (g_model) g_model.render();
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

  // auto-orbit the light
  g_lightAngle += 0.008;
  updateLightPos();

  // keep slider in sync with animated angle (0-360 range)
  var sliderAngle = ((g_lightAngle % (2 * Math.PI)) / (2 * Math.PI)) * 360;
  var sl = document.getElementById('lightSlider');
  if (sl && !sl._dragging) sl.value = sliderAngle.toFixed(1);

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
      addBlock();
    }
    g_mouseDown = false;
  });

  // light orbit slider 
  var lightSl = document.getElementById('lightSlider');
  lightSl.addEventListener('mousedown', function() { this._dragging = true;  });
  lightSl.addEventListener('mouseup',   function() { this._dragging = false; });
  lightSl.addEventListener('input', function() {
    g_lightAngle = (parseFloat(this.value) / 360) * 2 * Math.PI;
    updateLightPos();
  });

  // point light on/off
  document.getElementById('btnLighting').addEventListener('click', function() {
    g_lightOn = !g_lightOn;
    this.textContent = g_lightOn ? 'Light 1: ON' : 'Light 1: OFF';
    this.style.backgroundColor = g_lightOn ? '' : '#f0c8c8';
  });

  // spotlight on/off
  document.getElementById('btnSpot').addEventListener('click', function() {
    g_spotOn = !g_spotOn;
    this.textContent = g_spotOn ? 'Spotlight: ON' : 'Spotlight: OFF';
    this.style.backgroundColor = g_spotOn ? '' : '#f0c8c8';
  });

  // light color picker 
  document.getElementById('lightColorPicker').addEventListener('input', function() {
    var hex = this.value;
    g_lightColor[0] = parseInt(hex.slice(1, 3), 16) / 255;
    g_lightColor[1] = parseInt(hex.slice(3, 5), 16) / 255;
    g_lightColor[2] = parseInt(hex.slice(5, 7), 16) / 255;
  });

  // reset light color to white
  document.getElementById('btnResetColor').addEventListener('click', function() {
    g_lightColor = [1.0, 1.0, 1.0];
    document.getElementById('lightColorPicker').value = '#ffffff';
  });

  // normal visualization toggle
  document.getElementById('btnNormalViz').addEventListener('click', function() {
    g_showNormals = !g_showNormals;
    this.textContent = g_showNormals ? 'Normals: ON' : 'Normals: OFF';
    this.style.backgroundColor = g_showNormals ? '#c8f0c8' : '';
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
