//asgn1.js

// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'uniform float u_Size;\n' +
  'void main() {\n' +
  '  gl_Position = a_Position;\n' +
  '  gl_PointSize = u_Size;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  'precision mediump float;\n' +
  'uniform vec4 u_FragColor;\n' +  // uniform変数
  'void main() {\n' +
  '  gl_FragColor = u_FragColor;\n' +
  '}\n';

//globals 
let canvas; 
let gl; 
let a_Position;
let u_FragColor;
let u_Size;

let g_selectedColor = [1.0, 0.0, 0.0, 1.0]; 
let g_selectedSize = 10; 
let g_selectedType = 'square';
let g_selectedSegments = 30;
let g_eraserMode = false;

let g_lastX = null;
let g_lastY = null;

var shapesList = [];

class Point {
  constructor(x, y, color, size) {
    this.type = 'point';
    this.position = [x, y];
    this.color = color;
    this.size = size;
  }

  render() {
    var xy = this.position;
    var rgba = this.color;
    var size = this.size;

    // Pass the position of a point to a_Position variable
    gl.vertexAttrib3f(a_Position, xy[0], xy[1], 0.0);
    // Pass the color of a point to u_FragColor variable
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    // Pass the size of a point to u_Size variable
    gl.uniform1f(u_Size, size);
    // Draw
    gl.drawArrays(gl.POINTS, 0, 1);
  }
}

class Square {
  constructor(x, y, color, size) {
    this.type = 'square';
    this.position = [x, y];
    this.color = color;
    this.size = size;
  }

  render() {
    var xy = this.position;
    var rgba = this.color;
    var size = this.size / 100.0;
    var d = size;

    var vertices = new Float32Array([
      xy[0] - d, xy[1] + d,   // Top left
      xy[0] - d, xy[1] - d,   // Bottom left
      xy[0] + d, xy[1] + d,   // Top right
      xy[0] + d, xy[1] + d,   // Top right
      xy[0] - d, xy[1] - d,   // Bottom left
      xy[0] + d, xy[1] - d    // Bottom right
    ]);

    // Create a buffer object
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
      console.log('Failed to create the buffer object');
      return -1;
    }

    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // Write data into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);

    // Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Position);

    // Pass the color to u_FragColor variable
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
}

class Triangle {
  constructor(x, y, color, size, angle = 0) {
    this.type = 'triangle';
    this.position = [x, y];
    this.color = color;
    this.size = size;
    this.angle = angle;
  }

  render() {
    var xy = this.position;
    var rgba = this.color;
    var size = this.size / 100.0; 
    var d = size;
    var angle = this.angle;
    
    var v1 = [0, d];      // Top
    var v2 = [-d, -d];    // Bottom left
    var v3 = [d, -d];     // Bottom right
    
    if (angle !== 0) {
      var cos = Math.cos(angle);
      var sin = Math.sin(angle);
      
      var rotateVertex = function(v) {
        return [
          v[0] * cos - v[1] * sin,
          v[0] * sin + v[1] * cos
        ];
      };
      
      v1 = rotateVertex(v1);
      v2 = rotateVertex(v2);
      v3 = rotateVertex(v3);
    }
    
    var vertices = new Float32Array([
      xy[0] + v1[0], xy[1] + v1[1],
      xy[0] + v2[0], xy[1] + v2[1],
      xy[0] + v3[0], xy[1] + v3[1]
    ]);

    // based on HelloTriangle.js
    // Create a buffer object
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
      console.log('Failed to create the buffer object');
      return -1;
    }

    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // Write data into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);

    // Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Position);

    // Pass the color to u_FragColor variable
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    // Draw the triangle
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }
}

class Circle {
  constructor(x, y, color, size, segments) {
    this.type = 'circle';
    this.position = [x, y];
    this.color = color;
    this.size = size;
    this.segments = segments;
  }

  render() {
    var xy = this.position;
    var rgba = this.color;
    var radius = this.size / 100.0;
    var segments = parseInt(this.segments);

    var vertices = [];
    vertices.push(xy[0], xy[1]); // Center point

    for (var i = 0; i <= segments; i++) {
      var angle = (i * 2 * Math.PI) / segments;
      var x = xy[0] + radius * Math.cos(angle);
      var y = xy[1] + radius * Math.sin(angle);
      vertices.push(x, y);
    }

    var verticesArray = new Float32Array(vertices);

    // Create a buffer object
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
      console.log('Failed to create the buffer object');
      return -1;
    }

    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // Write data into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, verticesArray, gl.DYNAMIC_DRAW);

    // Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Position);

    // Pass the color to u_FragColor variable
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    gl.drawArrays(gl.TRIANGLE_FAN, 0, segments + 2);
  }
}

class Line {
  constructor(x1, y1, x2, y2, color, size) {
    this.type = 'line';
    this.start = [x1, y1];
    this.end = [x2, y2];
    this.color = color;
    this.size = size;
  }

  render() {
    var rgba = this.color;
    
    var vertices = new Float32Array([
      this.start[0], this.start[1],
      this.end[0], this.end[1]
    ]);

    // Create a buffer object
    var vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
      console.log('Failed to create the buffer object');
      return -1;
    }

    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    // Write data into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.DYNAMIC_DRAW);

    // Assign the buffer object to a_Position variable
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Position);

    // Pass the color to u_FragColor variable
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

    gl.lineWidth(this.size / 2);

    gl.drawArrays(gl.LINES, 0, 2);
  }
}

function setupWebGL(){
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
}

function connectVariablesToGLSL(){
    // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_Size
  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_Size) {
    console.log('Failed to get the storage location of u_Size');
    return;
  }
}

function main() {
    setupWebGL();
    connectVariablesToGLSL();
    addColors();

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = function(ev){ 
    if (g_gameActive) {
      [x,y] = convertCoordinatesEventToGL(ev);
      checkTargetHit(x, y);
    } else {
      click(ev);
    }
  };
  
  // Register function (event handler) to be called on mouse move
  canvas.onmousemove = function(ev){ 
    if (!g_gameActive) {
      click(ev);
    }
  };
  
  canvas.onmouseup = function(ev){ 
    g_lastX = null; 
    g_lastY = null; 
  };

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
}

function addColors() {
  document.getElementById('redSlider').addEventListener('input', function() {
    g_selectedColor[0] = parseFloat(this.value) / 100;
  });
  
  document.getElementById('greenSlider').addEventListener('input', function() {
    g_selectedColor[1] = parseFloat(this.value) / 100;
  });
  
  document.getElementById('blueSlider').addEventListener('input', function() {
    g_selectedColor[2] = parseFloat(this.value) / 100;
  });

  document.getElementById('sizeSlider').addEventListener('input', function() {
    g_selectedSize = parseFloat(this.value);
  });

  document.getElementById('segmentSlider').addEventListener('input', function() {
    g_selectedSegments = parseInt(this.value);
  });

  document.getElementById('squareButton').addEventListener('click', function() {
    g_selectedType = 'square';
    g_eraserMode = false;
  });

  document.getElementById('triangleButton').addEventListener('click', function() {
    g_selectedType = 'triangle';
    g_eraserMode = false;
  });

  document.getElementById('circleButton').addEventListener('click', function() {
    g_selectedType = 'circle';
    g_eraserMode = false;
  });

  document.getElementById('eraserButton').addEventListener('click', function() {
    g_eraserMode = true;
  });

  document.getElementById('clearButton').addEventListener('click', function() {
    shapesList = [];
    g_lastX = null;
    g_lastY = null;
    renderAllShapes();
  });

  initDrawing();
  
  initTargetGame();
}

function brushShape(x, y, angle) {
  let color = g_eraserMode ? [0.0, 0.0, 0.0, 1.0] : [g_selectedColor[0], g_selectedColor[1], g_selectedColor[2], 1.0];
  let shape;
  
  if (g_selectedType == 'point') {
    shape = new Point(x, y, color, g_selectedSize);
  } else if (g_selectedType == 'square') {
    shape = new Square(x, y, color, g_selectedSize);
  } else if (g_selectedType == 'triangle') {
    shape = new Triangle(x, y, color, g_selectedSize, angle);
  } else if (g_selectedType == 'circle') {
    shape = new Circle(x, y, color, g_selectedSize, g_selectedSegments);
  }
  
  return shape;
}

function fillGaps(x1, y1, x2, y2) {
  let color = g_eraserMode ? [0.0, 0.0, 0.0, 1.0] : [g_selectedColor[0], g_selectedColor[1], g_selectedColor[2], 1.0];
  let line = new Line(x1, y1, x2, y2, color, g_selectedSize);
  shapesList.push(line);
}

function click(ev) {
  if (ev.buttons == 1) {
    [x,y] = convertCoordinatesEventToGL(ev);

    let angle = 0;
    if (g_lastX !== null && g_lastY !== null) {
      let dx = x - g_lastX;
      let dy = y - g_lastY;
      angle = Math.atan2(dy, dx);
      
      fillGaps(g_lastX, g_lastY, x, y);
    }

    let shape = brushShape(x, y, angle);
    
    if (shape) {
      shapesList.push(shape);
    }

    g_lastX = x;
    g_lastY = y;

    renderAllShapes();
  } else {
    g_lastX = null;
    g_lastY = null;
  }
}

function convertCoordinatesEventToGL(ev){
        var x = ev.clientX; // x coordinate of a mouse pointer
        var y = ev.clientY; // y coordinate of a mouse pointer
        var rect = ev.target.getBoundingClientRect();

        x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
        y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

        return([x,y]);
    }

function renderAllShapes(){
  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  // Render all shapes in the shapes list
  var len =shapesList.length;
  for(var i = 0; i < len; i++) {
    shapesList[i].render();
  }
}
