// sphere.js

class Sphere {
  constructor() {
    this.type = 'sphere';
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.matrix = new Matrix4();
    this.latBands  = 24;
    this.longBands = 24;
    this._buildGeometry();
  }

  _buildGeometry() {
    this.positions = [];
    this.normals   = [];
    this.uvs       = [];

    var lb  = this.latBands;
    var lob = this.longBands;

    for (var lat = 0; lat < lb; lat++) {
      var theta1 = (lat       / lb)  * Math.PI;
      var theta2 = ((lat + 1) / lb)  * Math.PI;

      for (var lon = 0; lon < lob; lon++) {
        var phi1 = (lon       / lob) * 2 * Math.PI;
        var phi2 = ((lon + 1) / lob) * 2 * Math.PI;
        var p00 = [Math.sin(theta1)*Math.cos(phi1), Math.cos(theta1), Math.sin(theta1)*Math.sin(phi1)];
        var p10 = [Math.sin(theta2)*Math.cos(phi1), Math.cos(theta2), Math.sin(theta2)*Math.sin(phi1)];
        var p11 = [Math.sin(theta2)*Math.cos(phi2), Math.cos(theta2), Math.sin(theta2)*Math.sin(phi2)];
        var p01 = [Math.sin(theta1)*Math.cos(phi2), Math.cos(theta1), Math.sin(theta1)*Math.sin(phi2)];

        var u0 = lon       / lob,  u1 = (lon + 1) / lob;
        var v0 = lat       / lb,   v1 = (lat + 1) / lb;

        // triangle 1
        this.positions.push(...p00, ...p10, ...p11);
        this.normals  .push(...p00, ...p10, ...p11); // normal == position for unit sphere
        this.uvs      .push(u0,v0,  u0,v1,  u1,v1);

        // triangle 2
        this.positions.push(...p00, ...p11, ...p01);
        this.normals  .push(...p00, ...p11, ...p01);
        this.uvs      .push(u0,v0,  u1,v1,  u1,v0);
      }
    }
  }

  render() {
    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
    gl.uniform1f(u_texColorWeight, 0.0);
    gl.uniform4f(u_FragColor,
      this.color[0], this.color[1], this.color[2], this.color[3]);
    drawTriangle3DUVNormal(this.positions, this.uvs, this.normals);
  }
}
