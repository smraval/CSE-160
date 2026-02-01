// cube.js somewhat followed video 
class Cube {
  constructor() {
    this.type = 'cube';
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.matrix = new Matrix4();
  }

  render() {
    var rgba = this.color;
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    // Front face (z = 0)
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    drawTriangle3D([0,0,0,  1,1,0,  1,0,0]);
    drawTriangle3D([0,0,0,  0,1,0,  1,1,0]);

    // Back face (z = 1) 
    gl.uniform4f(u_FragColor, rgba[0]*0.8, rgba[1]*0.8, rgba[2]*0.8, rgba[3]);
    drawTriangle3D([0,0,1,  1,0,1,  1,1,1]);
    drawTriangle3D([0,0,1,  1,1,1,  0,1,1]);

    // Top face (y = 1) 
    gl.uniform4f(u_FragColor, rgba[0]*0.9, rgba[1]*0.9, rgba[2]*0.9, rgba[3]);
    drawTriangle3D([0,1,0,  0,1,1,  1,1,1]);
    drawTriangle3D([0,1,0,  1,1,1,  1,1,0]);

    // Bottom face (y = 0)
    gl.uniform4f(u_FragColor, rgba[0]*0.7, rgba[1]*0.7, rgba[2]*0.7, rgba[3]);
    drawTriangle3D([0,0,0,  1,0,1,  0,0,1]);
    drawTriangle3D([0,0,0,  1,0,0,  1,0,1]);

    // Right face (x = 1)
    gl.uniform4f(u_FragColor, rgba[0]*0.85, rgba[1]*0.85, rgba[2]*0.85, rgba[3]);
    drawTriangle3D([1,0,0,  1,1,1,  1,0,1]);
    drawTriangle3D([1,0,0,  1,1,0,  1,1,1]);

    // Left face (x = 0)
    gl.uniform4f(u_FragColor, rgba[0]*0.75, rgba[1]*0.75, rgba[2]*0.75, rgba[3]);
    drawTriangle3D([0,0,0,  0,0,1,  0,1,1]);
    drawTriangle3D([0,0,0,  0,1,1,  0,1,0]);
  }
}

function drawCube(M, color) {
  var rgba = color || [1.0, 1.0, 1.0, 1.0];
  gl.uniformMatrix4fv(u_ModelMatrix, false, M.elements);

  // Front face (z = 0)
  gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
  drawTriangle3D([0,0,0,  1,1,0,  1,0,0]);
  drawTriangle3D([0,0,0,  0,1,0,  1,1,0]);

  // Back face (z = 1) 
  gl.uniform4f(u_FragColor, rgba[0]*0.8, rgba[1]*0.8, rgba[2]*0.8, rgba[3]);
  drawTriangle3D([0,0,1,  1,0,1,  1,1,1]);
  drawTriangle3D([0,0,1,  1,1,1,  0,1,1]);

  // Top face (y = 1) 
  gl.uniform4f(u_FragColor, rgba[0]*0.9, rgba[1]*0.9, rgba[2]*0.9, rgba[3]);
  drawTriangle3D([0,1,0,  0,1,1,  1,1,1]);
  drawTriangle3D([0,1,0,  1,1,1,  1,1,0]);

  // Bottom face (y = 0) 
  gl.uniform4f(u_FragColor, rgba[0]*0.7, rgba[1]*0.7, rgba[2]*0.7, rgba[3]);
  drawTriangle3D([0,0,0,  1,0,1,  0,0,1]);
  drawTriangle3D([0,0,0,  1,0,0,  1,0,1]);

  // Right face (x = 1)
  gl.uniform4f(u_FragColor, rgba[0]*0.85, rgba[1]*0.85, rgba[2]*0.85, rgba[3]);
  drawTriangle3D([1,0,0,  1,1,1,  1,0,1]);
  drawTriangle3D([1,0,0,  1,1,0,  1,1,1]);

  // Left face (x = 0)
  gl.uniform4f(u_FragColor, rgba[0]*0.75, rgba[1]*0.75, rgba[2]*0.75, rgba[3]);
  drawTriangle3D([0,0,0,  0,0,1,  0,1,1]);
  drawTriangle3D([0,0,0,  0,1,1,  0,1,0]);
}


function drawCylinder(M, color, segments) {
  var rgba = color || [1.0, 1.0, 1.0, 1.0];
  var n = segments || 12;

  gl.uniformMatrix4fv(u_ModelMatrix, false, M.elements);
  var angleStep = 360 / n;

  for (var i = 0; i < n; i++) {
    var angle1 = i * angleStep * Math.PI / 180;
    var angle2 = (i + 1) * angleStep * Math.PI / 180;
    var x1 = Math.cos(angle1) * 0.5;
    var z1 = Math.sin(angle1) * 0.5;
    var x2 = Math.cos(angle2) * 0.5;
    var z2 = Math.sin(angle2) * 0.5;

    var shade = 0.8 + 0.2 * Math.cos(angle1);
    gl.uniform4f(u_FragColor, rgba[0]*shade, rgba[1]*shade, rgba[2]*shade, rgba[3]);
    drawTriangle3D([x1, 0, z1,  x2, 0, z2,  x2, 1, z2]);
    drawTriangle3D([x1, 0, z1,  x2, 1, z2,  x1, 1, z1]);

    gl.uniform4f(u_FragColor, rgba[0]*0.95, rgba[1]*0.95, rgba[2]*0.95, rgba[3]);
    drawTriangle3D([0, 1, 0,  x1, 1, z1,  x2, 1, z2]);

    gl.uniform4f(u_FragColor, rgba[0]*0.7, rgba[1]*0.7, rgba[2]*0.7, rgba[3]);
    drawTriangle3D([0, 0, 0,  x2, 0, z2,  x1, 0, z1]);
  }
}

