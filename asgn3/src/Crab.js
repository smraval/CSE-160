// crab.js 

var CRAB_SPAWNS = [
  [7,  8 ],
  [25, 6 ],
  [5,  13],
  [15, 25],
  [26, 26],
];

var g_crabAlive  = CRAB_SPAWNS.map(function() { return true; });
var g_crabsFound = 0;


function _crabMatrix(world, M) {
  var WM = new Matrix4(world);
  WM.multiply(M);
  gl.uniformMatrix4fv(u_ModelMatrix, false, WM.elements);
}

function _crabCube(world, M, c) {
  _crabMatrix(world, M);
  var r = c[0], g = c[1], b = c[2], a = c[3];

  // front (z=0)
  gl.uniform4f(u_FragColor, r, g, b, a);
  drawTriangle3D([0,0,0, 1,1,0, 1,0,0]);
  drawTriangle3D([0,0,0, 0,1,0, 1,1,0]);
  // back (z=1)
  gl.uniform4f(u_FragColor, r*0.9, g*0.9, b*0.9, a);
  drawTriangle3D([0,0,1, 1,0,1, 1,1,1]);
  drawTriangle3D([0,0,1, 1,1,1, 0,1,1]);
  // top (y=1)
  gl.uniform4f(u_FragColor, r*0.95, g*0.95, b*0.95, a);
  drawTriangle3D([0,1,0, 0,1,1, 1,1,1]);
  drawTriangle3D([0,1,0, 1,1,1, 1,1,0]);
  // bottom (y=0)
  gl.uniform4f(u_FragColor, r*0.7, g*0.7, b*0.7, a);
  drawTriangle3D([0,0,0, 1,0,1, 0,0,1]);
  drawTriangle3D([0,0,0, 1,0,0, 1,0,1]);
  // right (x=1)
  gl.uniform4f(u_FragColor, r*0.85, g*0.85, b*0.85, a);
  drawTriangle3D([1,0,0, 1,1,1, 1,0,1]);
  drawTriangle3D([1,0,0, 1,1,0, 1,1,1]);
  // left (x=0)
  gl.uniform4f(u_FragColor, r*0.75, g*0.75, b*0.75, a);
  drawTriangle3D([0,0,0, 0,0,1, 0,1,1]);
  drawTriangle3D([0,0,0, 0,1,1, 0,1,0]);
}


// render all alive crabs, called in renderScene() in world.js
function drawAllCrabs() {
  gl.uniform1f(u_texColorWeight, 0.0); 
  for (var i = 0; i < CRAB_SPAWNS.length; i++) {
    if (g_crabAlive[i]) {
      drawCrabAt(CRAB_SPAWNS[i][0], 0.15, CRAB_SPAWNS[i][1]);
    }
  }
}

//blocky crab and animations
function drawCrabAt(wx, wy, wz) {
  var dx  = camera.eye.elements[0] - wx;
  var dz  = camera.eye.elements[2] - wz;
  var yaw = Math.atan2(-dx, -dz) * 180 / Math.PI;

  var world = new Matrix4();
  world.setTranslate(wx, wy, wz);
  world.rotate(yaw, 0, 1, 0);
  world.scale(0.5, 0.5, 0.5);

  var t          = performance.now() / 1000;   // seconds
  var clawSwing  = 18 * Math.sin(t * 2.5);     // shoulder rock
  var elbowSwing = 12 * Math.sin(t * 2.5 + 0.5); // slight elbow lag
  var legSwing   = 15 * Math.sin(t * 4.0);     // faster leg stride

  var orange = [0.561, 0.114, 0.0,  1.0];
  var upLeg  = [0.651, 0.200, 0.008, 1.0];
  var dark   = [0.1,   0.05,  0.0,  1.0];
  var white  = [1.0,   1.0,   1.0,  1.0];

  var M = new Matrix4();

  // body 
  M.setTranslate(-0.5, -0.15, -0.5);
  M.scale(1.0, 0.3, 0.8);
  _crabCube(world, M, orange);

  // eyes
  M.setTranslate(-0.3, 0.15, -0.5);  M.scale(0.14, 0.1, 0.1);
  _crabCube(world, M, orange);

  M.setTranslate(-0.3, 0.25, -0.5);  M.scale(0.14, 0.2, 0.1);
  _crabCube(world, M, dark);

  M.setTranslate(-0.3, 0.37, -0.51); M.scale(0.06, 0.07, 0.04);
  _crabCube(world, M, white);

  M.setTranslate(0.2, 0.15, -0.5);   M.scale(0.14, 0.1, 0.1);
  _crabCube(world, M, orange);

  M.setTranslate(0.2, 0.25, -0.5);   M.scale(0.14, 0.2, 0.1);
  _crabCube(world, M, dark);

  M.setTranslate(0.2, 0.37, -0.51);  M.scale(0.06, 0.07, 0.04);
  _crabCube(world, M, white);

  // left claw
  M.setTranslate(-0.45, 0.05, 0);
  M.rotate(150 + clawSwing, 0, 0, 1);
  var shoulderL = new Matrix4(M);
  M.scale(0.25, 0.12, 0.12);
  _crabCube(world, M, orange);

  M = new Matrix4(shoulderL);
  M.translate(0.25, 0.123, 0);
  M.rotate(-180 + elbowSwing, 0, 0, 1);
  var elbowL = new Matrix4(M);
  M.scale(0.1, 0.19, 0.15);
  _crabCube(world, M, orange);

  // left pincer 
  M = new Matrix4(elbowL);
  M.translate(0.18, 0.2, 0);
  M.rotate(-65, 0, 0, 1);
  M.scale(0.15, 0.1, 0.15);
  var WM = new Matrix4(world); WM.multiply(M);
  gl.uniformMatrix4fv(u_ModelMatrix, false, WM.elements);
  gl.uniform4f(u_FragColor, orange[0], orange[1], orange[2], orange[3]);
  drawTriangularPrism([0,-1,0, -0.75,0.35,0, -2,0.8,0], 1.0);

  // left pincer 2
  M = new Matrix4(elbowL);
  M.translate(-0.05, 0.2, 0);
  M.rotate(-120, 0, 0, 1);
  M.scale(0.15, 0.1, 0.15);
  WM = new Matrix4(world); WM.multiply(M);
  gl.uniformMatrix4fv(u_ModelMatrix, false, WM.elements);
  gl.uniform4f(u_FragColor, orange[0], orange[1], orange[2], orange[3]);
  drawTriangularPrism([0,1,0, -0.75,-0.35,0, -2,-0.8,0], 1.0);

  // right claw
  M.setTranslate(0.5, -0.05, 0);
  M.rotate(20 - clawSwing, 0, 0, 1);
  var shoulderR = new Matrix4(M);
  M.scale(0.25, 0.12, 0.12);
  _crabCube(world, M, orange);

  M = new Matrix4(shoulderR);
  M.translate(0.14, 0.08, 0);
  M.rotate(-10 - elbowSwing, 0, 0, 1);
  var elbowR = new Matrix4(M);
  M.scale(0.1, 0.19, 0.15);
  _crabCube(world, M, orange);

  // right pincer
  M = new Matrix4(elbowR);
  M.translate(-0.07, 0.17, 0);
  M.rotate(90, 0, 0, 1);
  M.scale(0.15, 0.1, 0.15);
  WM = new Matrix4(world); WM.multiply(M);
  gl.uniformMatrix4fv(u_ModelMatrix, false, WM.elements);
  gl.uniform4f(u_FragColor, orange[0], orange[1], orange[2], orange[3]);
  drawTriangularPrism([0,-1,0, 0.75,0.35,0, 2,0.8,0], 1.0);

  // right pincer 2
  M = new Matrix4(elbowR);
  M.translate(0.15, 0.15, 0);
  M.rotate(120, 0, 0, 1);
  M.scale(0.15, 0.1, 0.15);
  WM = new Matrix4(world); WM.multiply(M);
  gl.uniformMatrix4fv(u_ModelMatrix, false, WM.elements);
  gl.uniform4f(u_FragColor, orange[0], orange[1], orange[2], orange[3]);
  drawTriangularPrism([0,1,0, 0.75,-0.35,0, 2,-0.8,0], 1.0);

  var legs = [
    [-0.51, -0.11,  0.1, -121],
    [-0.51, -0.11, -0.1, -121],
    [-0.51, -0.11, -0.3, -121],
    [ 0.43, -0.17,  0.1,  -50],
    [ 0.43, -0.17, -0.1,  -50],
    [ 0.43, -0.17, -0.3,  -50],
  ];
  for (var li = 0; li < legs.length; li++) {
    var l = legs[li];
    var phase = legSwing * (li % 2 === 0 ? 1 : -1); 
    M.setTranslate(l[0], l[1], l[2]);
    M.rotate(l[3] + phase, 0, 0, 1);
    M.scale(0.20, 0.10, 0.09);
    _crabCube(world, M, upLeg);
  }
}

// catching the crab
function tryCatchCrab() {
  var ex = camera.eye.elements[0];
  var ez = camera.eye.elements[2];
  for (var i = 0; i < CRAB_SPAWNS.length; i++) {
    if (!g_crabAlive[i]) continue;
    var dx = ex - CRAB_SPAWNS[i][0];
    var dz = ez - CRAB_SPAWNS[i][1];
    if (dx * dx + dz * dz < 9) { // proximity to camera/player
      g_crabAlive[i] = false;
      g_crabsFound++;
      var el = document.getElementById('crabCount');
      if (el) el.innerText = g_crabsFound + ' / ' + CRAB_SPAWNS.length;
      return true;
    }
  }
  return false;
}
