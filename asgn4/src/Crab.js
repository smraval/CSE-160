// crab.js 

function _crabMatrix(world, M) {
  var WM = new Matrix4(world);
  WM.multiply(M);
  gl.uniformMatrix4fv(u_ModelMatrix, false, WM.elements);
}

function _crabCube(world, M, c) {
  _crabMatrix(world, M);
  var r = c[0], g = c[1], b = c[2], a = c[3];

  gl.uniform4f(u_FragColor, r, g, b, a);

  var nFront  = [ 0, 0,-1,  0, 0,-1,  0, 0,-1];
  var nBack   = [ 0, 0, 1,  0, 0, 1,  0, 0, 1];
  var nTop    = [ 0, 1, 0,  0, 1, 0,  0, 1, 0];
  var nBottom = [ 0,-1, 0,  0,-1, 0,  0,-1, 0];
  var nRight  = [ 1, 0, 0,  1, 0, 0,  1, 0, 0];
  var nLeft   = [-1, 0, 0, -1, 0, 0, -1, 0, 0];

  drawTriangle3DNormal([0,0,0, 1,1,0, 1,0,0], nFront);
  drawTriangle3DNormal([0,0,0, 0,1,0, 1,1,0], nFront);
  drawTriangle3DNormal([0,0,1, 1,0,1, 1,1,1], nBack);
  drawTriangle3DNormal([0,0,1, 1,1,1, 0,1,1], nBack);
  drawTriangle3DNormal([0,1,0, 0,1,1, 1,1,1], nTop);
  drawTriangle3DNormal([0,1,0, 1,1,1, 1,1,0], nTop);
  drawTriangle3DNormal([0,0,0, 1,0,1, 0,0,1], nBottom);
  drawTriangle3DNormal([0,0,0, 1,0,0, 1,0,1], nBottom);
  drawTriangle3DNormal([1,0,0, 1,1,1, 1,0,1], nRight);
  drawTriangle3DNormal([1,0,0, 1,1,0, 1,1,1], nRight);
  drawTriangle3DNormal([0,0,0, 0,0,1, 0,1,1], nLeft);
  drawTriangle3DNormal([0,0,0, 0,1,1, 0,1,0], nLeft);
}


//blocky crab and animations
function drawCrabAt(wx, wy, wz, size) {
  size = (size !== undefined) ? size : 0.5;
  var dx  = camera.eye.elements[0] - wx;
  var dz  = camera.eye.elements[2] - wz;
  var yaw = Math.atan2(-dx, -dz) * 180 / Math.PI;

  var world = new Matrix4();
  world.setTranslate(wx, wy, wz);
  world.rotate(yaw, 0, 1, 0);
  world.scale(size, size, size);

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
