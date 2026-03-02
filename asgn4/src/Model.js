// model.js (burger)

class Model {
  constructor() {
    this.color  = [0.85, 0.55, 0.22, 1.0];
    this.matrix = new Matrix4();
    this._posBuf    = null;
    this._nrmBuf    = null;
    this._uvBuf     = null;
    this._vertCount = 0;
    this.loaded     = false;
  }

  load(url) {
    fetch(url)
      .then(r => {
        if (!r.ok) throw new Error('HTTP ' + r.status + ' for ' + url);
        return r.text();
      })
      .then(text => {
        var data = this._parse(text);
        this._initBuffers(data);
        this.loaded = true;
        console.log('Model loaded: ' + url + ' (' + this._vertCount + ' vertices)');
      })
      .catch(err => console.error('Model.load failed: ' + err));
  }

  _parse(text) {
    var rawPos = [];   
    var rawNrm = [];   
    var positions = [];
    var normals   = [];

    var lines = text.split('\n');
    for (var i = 0; i < lines.length; i++) {
      var line = lines[i].trim();
      if (!line || line.charAt(0) === '#') continue;
      var parts = line.split(/\s+/);
      var tok   = parts[0];

      if (tok === 'v') {
        rawPos.push(parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3]));

      } else if (tok === 'vn') {
        rawNrm.push(parseFloat(parts[1]), parseFloat(parts[2]), parseFloat(parts[3]));

      } else if (tok === 'f') {
        var fv = [];   
        for (var j = 1; j < parts.length; j++) {
          var idx = parts[j].split('/');
          var vi  = (parseInt(idx[0]) - 1) * 3;
          var ni  = (idx.length > 2 && idx[2] !== '')
                      ? (parseInt(idx[2]) - 1) * 3
                      : 0;
          fv.push(vi, ni);
        }

        var numFV = parts.length - 1; 
        for (var k = 1; k < numFV - 1; k++) {
          var v0i = fv[0],       n0i = fv[1];
          var v1i = fv[k * 2],   n1i = fv[k * 2 + 1];
          var v2i = fv[(k+1)*2], n2i = fv[(k+1)*2 + 1];

          positions.push(
            rawPos[v0i], rawPos[v0i+1], rawPos[v0i+2],
            rawPos[v1i], rawPos[v1i+1], rawPos[v1i+2],
            rawPos[v2i], rawPos[v2i+1], rawPos[v2i+2]
          );
          normals.push(
            rawNrm[n0i], rawNrm[n0i+1], rawNrm[n0i+2],
            rawNrm[n1i], rawNrm[n1i+1], rawNrm[n1i+2],
            rawNrm[n2i], rawNrm[n2i+1], rawNrm[n2i+2]
          );
        }
      }
    }

    return {
      positions: new Float32Array(positions),
      normals:   new Float32Array(normals)
    };
  }

  // upload geometry to GPU as static buffers
  _initBuffers(data) {
    this._posBuf = gl.createBuffer();
    this._nrmBuf = gl.createBuffer();
    this._uvBuf  = gl.createBuffer();

    gl.bindBuffer(gl.ARRAY_BUFFER, this._posBuf);
    gl.bufferData(gl.ARRAY_BUFFER, data.positions, gl.STATIC_DRAW);

    gl.bindBuffer(gl.ARRAY_BUFFER, this._nrmBuf);
    gl.bufferData(gl.ARRAY_BUFFER, data.normals, gl.STATIC_DRAW);

    var dummyUV = new Float32Array(data.positions.length / 3 * 2);
    gl.bindBuffer(gl.ARRAY_BUFFER, this._uvBuf);
    gl.bufferData(gl.ARRAY_BUFFER, dummyUV, gl.STATIC_DRAW);

    this._vertCount = data.positions.length / 3;
  }

  render() {
    if (!this.loaded) return;

    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
    gl.uniform1f(u_texColorWeight, 0.0);
    gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);

    gl.bindBuffer(gl.ARRAY_BUFFER, this._posBuf);
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);

    gl.bindBuffer(gl.ARRAY_BUFFER, this._nrmBuf);
    gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Normal);

    gl.bindBuffer(gl.ARRAY_BUFFER, this._uvBuf);
    gl.vertexAttribPointer(a_TexCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_TexCoord);

    gl.drawArrays(gl.TRIANGLES, 0, this._vertCount);
  }
}
