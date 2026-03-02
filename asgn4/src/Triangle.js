class Triangle {
  constructor() {
    this.type = 'triangle';
    this.position = [0.0, 0.0, 0.0];
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.size = 5.0;
  }

  render() {
    var xy = this.position;
    var rgba = this.color;
    var size = this.size;

    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    gl.uniform1f(u_PointSize, size);
    gl.uniformMatrix4fv(u_ModelMatrix, false, g_identityMatrix.elements);

    var d = this.size / 200.0;
    drawTriangle([xy[0], xy[1], xy[0] + d, xy[1], xy[0], xy[1] + d]);
  }
}

function drawTriangle(vertices) {
  var n = vertices.length / 2; 

  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

  gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);

  gl.drawArrays(gl.TRIANGLES, 0, n);
}

function drawTriangle3D(vertices) {
  var n = vertices.length / 3;
  if (!g_posBuffer) g_posBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, g_posBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);

  if (typeof a_TexCoord !== 'undefined' && a_TexCoord >= 0) {
    gl.disableVertexAttribArray(a_TexCoord);
    gl.vertexAttrib2f(a_TexCoord, 0.0, 0.0);
  }

  // bind default normals 
  if (typeof a_Normal !== 'undefined' && a_Normal >= 0) {
    var dN = [];
    for (var i = 0; i < n; i++) { dN.push(0, 1, 0); }
    if (!g_normalBuffer) g_normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, g_normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(dN), gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Normal);
  }

  gl.drawArrays(gl.TRIANGLES, 0, n);
}

// draw a 3D triangle (no uv no nomrals)
function drawTriangle3DNormal(vertices, normals) {
  var n = vertices.length / 3;

  if (!g_posBuffer)    g_posBuffer    = gl.createBuffer();
  if (!g_normalBuffer) g_normalBuffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, g_posBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);

  if (typeof a_TexCoord !== 'undefined' && a_TexCoord >= 0) {
    gl.disableVertexAttribArray(a_TexCoord);
    gl.vertexAttrib2f(a_TexCoord, 0.0, 0.0);
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, g_normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.DYNAMIC_DRAW);
  gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Normal);

  gl.drawArrays(gl.TRIANGLES, 0, n);
}

var g_posBuffer    = null;
var g_uvBuffer     = null;
var g_normalBuffer = null;

function initPersistentBuffers() {
  g_posBuffer    = gl.createBuffer();
  g_uvBuffer     = gl.createBuffer();
  g_normalBuffer = gl.createBuffer();
}

function drawTriangle3DUV(positions, uvs) {
  var n = positions.length / 3;

  if (!g_posBuffer) g_posBuffer = gl.createBuffer();
  if (!g_uvBuffer)  g_uvBuffer  = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, g_posBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.DYNAMIC_DRAW);
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);

  gl.bindBuffer(gl.ARRAY_BUFFER, g_uvBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.DYNAMIC_DRAW);
  gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_TexCoord);

  // bind default debug normals
  if (typeof a_Normal !== 'undefined' && a_Normal >= 0) {
    var dN = [];
    for (var i = 0; i < n; i++) { dN.push(1, 1, 0); }
    if (!g_normalBuffer) g_normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, g_normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(dN), gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Normal);
  }

  gl.drawArrays(gl.TRIANGLES, 0, n);
}

function drawTriangle3DUVNormal(positions, uvs, normals) {
  var n = positions.length / 3;

  if (!g_posBuffer)    g_posBuffer    = gl.createBuffer();
  if (!g_uvBuffer)     g_uvBuffer     = gl.createBuffer();
  if (!g_normalBuffer) g_normalBuffer = gl.createBuffer();

  gl.bindBuffer(gl.ARRAY_BUFFER, g_posBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.DYNAMIC_DRAW);
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);

  gl.bindBuffer(gl.ARRAY_BUFFER, g_uvBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(uvs), gl.DYNAMIC_DRAW);
  gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_TexCoord);

  gl.bindBuffer(gl.ARRAY_BUFFER, g_normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.DYNAMIC_DRAW);
  gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Normal);

  gl.drawArrays(gl.TRIANGLES, 0, n);
}

function drawTriangularPrism(vertices3D, depth) {
  depth = depth || 0.15;

  var x1=vertices3D[0], y1=vertices3D[1], z1=vertices3D[2];
  var x2=vertices3D[3], y2=vertices3D[4], z2=vertices3D[5];
  var x3=vertices3D[6], y3=vertices3D[7], z3=vertices3D[8];

  function cross(ax,ay,az, bx,by,bz) {
    return [ay*bz-az*by, az*bx-ax*bz, ax*by-ay*bx];
  }
  function normalize(v) {
    var len = Math.sqrt(v[0]*v[0]+v[1]*v[1]+v[2]*v[2]) || 1;
    return [v[0]/len, v[1]/len, v[2]/len];
  }
  function faceN(n) { return [n[0],n[1],n[2], n[0],n[1],n[2], n[0],n[1],n[2]]; }

  var nFv = normalize(cross(x2-x1,y2-y1,z2-z1, x3-x1,y3-y1,z3-z1));
  var nFn = faceN(nFv);
  var nBn = faceN([-nFv[0],-nFv[1],-nFv[2]]);

  function sideN(ax,ay,az, bx,by,bz) {
    return faceN(normalize(cross(bx-ax,by-ay,bz-az, 0,0,1)));
  }

  drawTriangle3DNormal([x1,y1,z1, x2,y2,z2, x3,y3,z3], nFn);
  drawTriangle3DNormal([x1,y1,z1+depth, x3,y3,z3+depth, x2,y2,z2+depth], nBn);

  var n12 = sideN(x1,y1,z1, x2,y2,z2);
  drawTriangle3DNormal([x1,y1,z1, x2,y2,z2, x2,y2,z2+depth], n12);
  drawTriangle3DNormal([x1,y1,z1, x2,y2,z2+depth, x1,y1,z1+depth], n12);

  var n23 = sideN(x2,y2,z2, x3,y3,z3);
  drawTriangle3DNormal([x2,y2,z2, x3,y3,z3, x3,y3,z3+depth], n23);
  drawTriangle3DNormal([x2,y2,z2, x3,y3,z3+depth, x2,y2,z2+depth], n23);

  var n31 = sideN(x3,y3,z3, x1,y1,z1);
  drawTriangle3DNormal([x3,y3,z3, x1,y1,z1, x1,y1,z1+depth], n31);
  drawTriangle3DNormal([x3,y3,z3, x1,y1,z1+depth, x3,y3,z3+depth], n31);
}