// Cube.js
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

    // Front face (z = 0)
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    drawTriangle3DUV(
      [0,0,0,  1,1,0,  1,0,0],
      [0,0,    1,1,    1,0  ]
    );
    drawTriangle3DUV(
      [0,0,0,  0,1,0,  1,1,0],
      [0,0,    0,1,    1,1  ]
    );

    // Back face (z = 1)
    gl.uniform4f(u_FragColor, rgba[0]*0.9, rgba[1]*0.9, rgba[2]*0.9, rgba[3]);
    drawTriangle3DUV(
      [0,0,1,  1,0,1,  1,1,1],
      [1,0,    0,0,    0,1  ]
    );
    drawTriangle3DUV(
      [0,0,1,  1,1,1,  0,1,1],
      [1,0,    0,1,    1,1  ]
    );

    // Top face (y = 1)
    gl.uniform4f(u_FragColor, rgba[0]*0.95, rgba[1]*0.95, rgba[2]*0.95, rgba[3]);
    drawTriangle3DUV(
      [0,1,0,  0,1,1,  1,1,1],
      [0,1,    0,0,    1,0  ]
    );
    drawTriangle3DUV(
      [0,1,0,  1,1,1,  1,1,0],
      [0,1,    1,0,    1,1  ]
    );

    // Bottom face (y = 0)
    gl.uniform4f(u_FragColor, rgba[0]*0.7, rgba[1]*0.7, rgba[2]*0.7, rgba[3]);
    drawTriangle3DUV(
      [0,0,0,  1,0,1,  0,0,1],
      [0,0,    1,1,    0,1  ]
    );
    drawTriangle3DUV(
      [0,0,0,  1,0,0,  1,0,1],
      [0,0,    1,0,    1,1  ]
    );

    // Right face (x = 1)
    gl.uniform4f(u_FragColor, rgba[0]*0.85, rgba[1]*0.85, rgba[2]*0.85, rgba[3]);
    drawTriangle3DUV(
      [1,0,0,  1,1,1,  1,0,1],
      [0,0,    1,1,    1,0  ]
    );
    drawTriangle3DUV(
      [1,0,0,  1,1,0,  1,1,1],
      [0,0,    0,1,    1,1  ]
    );

    // Left face (x = 0)
    gl.uniform4f(u_FragColor, rgba[0]*0.75, rgba[1]*0.75, rgba[2]*0.75, rgba[3]);
    drawTriangle3DUV(
      [0,0,0,  0,0,1,  0,1,1],
      [1,0,    0,0,    0,1  ]
    );
    drawTriangle3DUV(
      [0,0,0,  0,1,1,  0,1,0],
      [1,0,    0,1,    1,1  ]
    );
  }
}
