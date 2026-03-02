// cube.js
class Cube {
  constructor() {
    this.type = 'cube';
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.textureWeight = 0.0; 
    this.matrix = new Matrix4();
  }

  translate(x, y, z) {
    this.matrix.translate(x, y, z);
    return this;
  }

  scale(x, y, z) {
    this.matrix.scale(x, y, z);
    return this;
  }

  render() {
    var rgba = this.color;
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
    gl.uniform1f(u_texColorWeight, this.textureWeight);

    var nFront  = [ 0, 0,-1,  0, 0,-1,  0, 0,-1];
    var nBack   = [ 0, 0, 1,  0, 0, 1,  0, 0, 1];
    var nTop    = [ 0, 1, 0,  0, 1, 0,  0, 1, 0];
    var nBottom = [ 0,-1, 0,  0,-1, 0,  0,-1, 0];
    var nRight  = [ 1, 0, 0,  1, 0, 0,  1, 0, 0];
    var nLeft   = [-1, 0, 0, -1, 0, 0, -1, 0, 0];

    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    
    // Front face (z = 0)
    drawTriangle3DUVNormal([0,0,0, 1,1,0, 1,0,0], [0,0, 1,1, 1,0], nFront);
    drawTriangle3DUVNormal([0,0,0, 0,1,0, 1,1,0], [0,0, 0,1, 1,1], nFront);

    // Back face (z = 1)
    drawTriangle3DUVNormal([0,0,1, 1,0,1, 1,1,1], [1,0, 0,0, 0,1], nBack);
    drawTriangle3DUVNormal([0,0,1, 1,1,1, 0,1,1], [1,0, 0,1, 1,1], nBack);

    // Top face (y = 1)
    drawTriangle3DUVNormal([0,1,0, 0,1,1, 1,1,1], [0,1, 0,0, 1,0], nTop);
    drawTriangle3DUVNormal([0,1,0, 1,1,1, 1,1,0], [0,1, 1,0, 1,1], nTop);

    // Bottom face (y = 0)
    drawTriangle3DUVNormal([0,0,0, 1,0,1, 0,0,1], [0,0, 1,1, 0,1], nBottom);
    drawTriangle3DUVNormal([0,0,0, 1,0,0, 1,0,1], [0,0, 1,0, 1,1], nBottom);

    // Right face (x = 1)
    drawTriangle3DUVNormal([1,0,0, 1,1,1, 1,0,1], [0,0, 1,1, 1,0], nRight);
    drawTriangle3DUVNormal([1,0,0, 1,1,0, 1,1,1], [0,0, 0,1, 1,1], nRight);

    // Left face (x = 0)
    drawTriangle3DUVNormal([0,0,0, 0,0,1, 0,1,1], [1,0, 0,0, 0,1], nLeft);
    drawTriangle3DUVNormal([0,0,0, 0,1,1, 0,1,0], [1,0, 0,1, 1,1], nLeft);
  }
}
