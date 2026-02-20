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

  gl.drawArrays(gl.TRIANGLES, 0, n);
}

var g_posBuffer = null;
var g_uvBuffer  = null;

function initPersistentBuffers() {
  g_posBuffer = gl.createBuffer();
  g_uvBuffer  = gl.createBuffer();
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

  gl.drawArrays(gl.TRIANGLES, 0, n);
}

function drawTriangularPrism(vertices3D, depth) {
  depth = depth || 0.15; 
  
  var x1 = vertices3D[0], y1 = vertices3D[1], z1 = vertices3D[2];
  var x2 = vertices3D[3], y2 = vertices3D[4], z2 = vertices3D[5];
  var x3 = vertices3D[6], y3 = vertices3D[7], z3 = vertices3D[8];
  
  drawTriangle3D([
    x1, y1, z1,
    x2, y2, z2,
    x3, y3, z3
  ]);
  
  drawTriangle3D([
    x1, y1, z1 + depth,
    x3, y3, z3 + depth,
    x2, y2, z2 + depth
  ]);
  
  drawTriangle3D([
    x1, y1, z1,
    x2, y2, z2,
    x2, y2, z2 + depth
  ]);
  drawTriangle3D([
    x1, y1, z1,
    x2, y2, z2 + depth,
    x1, y1, z1 + depth
  ]);
  
  drawTriangle3D([
    x2, y2, z2,
    x3, y3, z3,
    x3, y3, z3 + depth
  ]);
  drawTriangle3D([
    x2, y2, z2,
    x3, y3, z3 + depth,
    x2, y2, z2 + depth
  ]);
  
  drawTriangle3D([
    x3, y3, z3,
    x1, y1, z1,
    x1, y1, z1 + depth
  ]);
  drawTriangle3D([
    x3, y3, z3,
    x1, y1, z1 + depth,
    x3, y3, z3 + depth
  ]);
}