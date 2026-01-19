// drawing.js -- my initials/drawing picture
class CustomTriangle {
  constructor(x1, y1, x2, y2, x3, y3, color) {
    this.type = 'customTriangle';
    this.vertices = [x1, y1, x2, y2, x3, y3];
    this.color = color;
  }

  render() {
    var rgba = this.color;
    var vertices = new Float32Array(this.vertices);

    // based on HelloTriangle.js
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
      console.log('Failed to create the buffer object');
      return -1;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(a_Position);
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
}

function drawMyPicture() {
  let darkPink = [0.85, 0.44, 0.58, 1.0];
  let mediumPink = [0.96, 0.61, 0.69, 1.0];   
  let lightPink = [1.0, 0.75, 0.80, 1.0];     
  let hotPink = [0.95, 0.35, 0.55, 1.0];      
  let sTriangles = [

    [-0.9, 0.9, -0.3, 0.9, -0.9, 0.6, mediumPink],
    [-0.3, 0.9, -0.3, 0.6, -0.9, 0.6, darkPink],
    
    [-0.9, 0.6, -0.6, 0.6, -0.9, 0.3, lightPink],
    [-0.6, 0.6, -0.6, 0.3, -0.9, 0.3, hotPink],
    
    [-0.9, 0.3, -0.3, 0.3, -0.9, 0.0, mediumPink],
    [-0.3, 0.3, -0.3, 0.0, -0.9, 0.0, darkPink],
    
    [-0.3, 0.0, -0.6, 0.0, -0.3, -0.3, hotPink],
    [-0.6, 0.0, -0.6, -0.3, -0.3, -0.3, lightPink],
    
    [-0.9, -0.3, -0.3, -0.3, -0.9, -0.6, darkPink],
    [-0.3, -0.3, -0.3, -0.6, -0.9, -0.6, mediumPink],
    
    [-0.9, -0.6, -0.3, -0.6, -0.6, -0.9, lightPink],
    [-0.3, -0.6, -0.3, -0.9, -0.6, -0.9, hotPink],
  ];
  
  let rTriangles = [
    [0.1, 0.9, 0.7, 0.9, 0.1, 0.6, mediumPink],
    [0.7, 0.9, 0.7, 0.6, 0.1, 0.6, darkPink],
    
    [0.7, 0.9, 0.95, 0.75, 0.7, 0.6, hotPink],
    [0.95, 0.75, 0.95, 0.6, 0.7, 0.6, lightPink],
    
    [0.7, 0.6, 0.95, 0.6, 0.7, 0.3, darkPink],
    [0.95, 0.6, 0.95, 0.3, 0.7, 0.3, mediumPink],
    
    [0.1, 0.3, 0.7, 0.3, 0.1, 0.0, lightPink],
    [0.7, 0.3, 0.7, 0.0, 0.1, 0.0, hotPink],
    
    [0.1, 0.9, 0.4, 0.9, 0.1, -0.9, darkPink],
    [0.4, 0.9, 0.4, -0.9, 0.1, -0.9, mediumPink],
    
    [0.4, 0.0, 0.7, 0.0, 0.7, -0.5, lightPink],
    [0.7, 0.0, 0.95, -0.3, 0.7, -0.5, hotPink],
    
    [0.7, -0.5, 0.95, -0.3, 0.95, -0.7, mediumPink],
    [0.7, -0.5, 0.95, -0.7, 0.85, -0.9, darkPink],
  ];
  
  let allTriangles = sTriangles.concat(rTriangles);
  
  for (let i = 0; i < allTriangles.length; i++) {
    let t = allTriangles[i];
    let tri = new CustomTriangle(
      t[0], t[1],  
      t[2], t[3],  
      t[4], t[5], 
      t[6]         
    );
    shapesList.push(tri);
  }
  
  renderAllShapes();
}

function initDrawing() {
  document.getElementById('drawPictureButton').addEventListener('click', function() {
    drawMyPicture();
  });

  let imageVisible = false;
  document.getElementById('toggleReferenceButton').addEventListener('click', function() {
    let refImage = document.getElementById('referenceImage');
    imageVisible = !imageVisible;
    
    if (imageVisible) {
      refImage.style.display = 'block';
      this.textContent = 'Hide Reference Image';
    } else {
      refImage.style.display = 'none';
      this.textContent = 'See Reference Image';
    }
  });
}
