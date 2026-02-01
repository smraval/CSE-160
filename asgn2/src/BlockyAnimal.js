// BlockyAnimal.js 
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotation;
  void main() {
    gl_Position = u_GlobalRotation * u_ModelMatrix * a_Position;
  }
`;

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }
`;

// globals
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_ModelMatrix;
let u_GlobalRotation;
let gAnimalGlobalRotation = 0;

// joint angles
let gClawShoulderAngle = 0;     
let gClawElbowAngle = 0;        
let gClawShoulderRAngle = 0;     
let gClawElbowRAngle = 0;        
let gClawPincerRAngle = 0;       
let gLegHipAngle = 0;            
let gLegKneeAngle = 0;          

// animation
let g_time = 0;                 
let g_animationEnabled = false;  

// mouse control
let g_isDragging = false;        
let g_lastMouseX = 0;            

// poke animation
let g_pokeActive = false;       
let g_pokeStartTime = 0;         
let g_pokeDuration = 500;        
let g_pokeHeight = 0.4;          

// performance tracking
let g_lastFrameTime = performance.now();
let g_frameCount = 0;
let g_fps = 0;
let g_fpsUpdateInterval = 500;   
let g_lastFpsUpdate = performance.now();

function setupWebGL() {
  canvas = document.getElementById('webgl');
  if (!canvas) {
    console.error('Failed to get canvas element');
    return;
  }

  gl = canvas.getContext('webgl', { preserveDrawingBuffer: true });
  if (!gl) {
    console.error('Failed to get WebGL context');
    return;
  }

  gl.enable(gl.DEPTH_TEST);
  console.log('WebGL context initialized successfully');
}

function connectVariablesToGLSL() {
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to initialize shaders');
    return false;
  }

  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get a_Position');
    return false;
  }

  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get u_FragColor');
    return false;
  }

  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get u_ModelMatrix');
    return false;
  }

  u_GlobalRotation = gl.getUniformLocation(gl.program, 'u_GlobalRotation');
  if (!u_GlobalRotation) {
    console.log('Failed to get u_GlobalRotation');
    return false;
  }
  
  console.log('Shaders initialized successfully');
  return true;
}

// poke animation math
function getPokeOffset() {
    if (!g_pokeActive) return 0;  
        var elapsed = performance.now() - g_pokeStartTime;
        if (elapsed >= g_pokeDuration) {
            g_pokeActive = false;
            return 0;
        }
        
        var progress = elapsed / g_pokeDuration;  // 0 to 1
        var height = g_pokeHeight * Math.abs(Math.sin(progress * Math.PI * 2));  // Two complete sine waves
        
        return height;
}

function renderScene() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    var gRot = new Matrix4();
    gRot.setRotate(gAnimalGlobalRotation, 0, 1, 0);
   
    var pokeOffset = getPokeOffset();
    gRot.translate(0, pokeOffset, 0);

    gl.uniformMatrix4fv(u_GlobalRotation, false, gRot.elements);

    var M = new Matrix4();
    var crabOrange = [0.561, 0.114, 0.0, 1.0]; // #B64B1C
    var upperLegColor = [0.651, 0.200, 0.008, 1.0]; // #BA4D1D
    var lowerLegColor = [0.6510, 0.2000, 0.0078, 1.0]; // #A63302
    var blackColor = [0.0, 0.0, 0.0, 1.0]; // #000000
    var whiteColor = [1.0, 1.0, 1.0, 1.0]; // #FFFFFF
    var pincerColor = [0.5333, 0.1647, 0.0, 1.0]; // #882A00
    var darkBrown = [0.1, 0.05, 0.0, 1.0]; // Dark brown for eye pupils


  // crabBody
  M.setTranslate(-0.5, -0.15, -0.5);
  M.scale(1.0, 0.3, 0.8);  
  drawCube(M, crabOrange);

  /* EYE STUFF */
    // left eye bump
    M.setTranslate(-0.3, 0.15, -0.5);
    M.scale(0.14, 0.1, 0.1);
    drawCube(M, crabOrange);

    // left eye pupil
    M.setTranslate(-0.3, 0.25, -0.5);
    M.scale(0.14, 0.2, 0.1);
    drawCube(M, darkBrown);

    // right eye bump
    M.setTranslate(0.2, 0.15, -0.5);
    M.scale(0.14, 0.1, 0.1);
    drawCube(M, crabOrange);

    // right eye pupil
    M.setTranslate(0.2, 0.25, -0.5);
    M.scale(0.14, 0.2, 0.1);
    drawCube(M, darkBrown);

    // left eye highlight
    M.setTranslate(-0.3, 0.37, -0.51);
    M.scale(0.06, 0.07, 0.04);
    drawCube(M, whiteColor);

    // right eye highlight
    M.setTranslate(0.2, 0.37, -0.51);
    M.scale(0.06, 0.07, 0.04);
    drawCube(M, whiteColor);

  /* MORE ROTATION STUFF */
  // left claw to upper arm 
  M.setTranslate(-0.45, 0.05, 0);
  M.rotate(150 + gClawShoulderAngle, 0, 0, 1);
  var shoulderMatrix = new Matrix4(M);  // Save shoulder transformation
  M.scale(0.25, 0.12, 0.12);
  drawCube(M, crabOrange);

  // left claw to forearm to shoulder
  M = new Matrix4(shoulderMatrix);  
  M.translate(0.25, 0.123, 0);  
  M.rotate(-180 + gClawElbowAngle, 0, 0, 1);  
  var elbowMatrix = new Matrix4(M);  
  M.scale(0.1, 0.19, 0.15);
  drawCube(M, crabOrange);

  // left claw to pincer tip on elbow
  M = new Matrix4(elbowMatrix);
  M.translate(0.18, 0.2, 0);  
  M.rotate(-65, 0, 0, 1);
  M.scale(0.15, 0.1, 0.15);
  gl.uniformMatrix4fv(u_ModelMatrix, false, M.elements);
  gl.uniform4f(u_FragColor, crabOrange[0], crabOrange[1], crabOrange[2], crabOrange[3]);
  drawTriangularPrism([0, -1, 0,   -0.75, 0.35, 0,   -2, 0.8, 0], 1.0);

  // left to pincer from elbow
  M = new Matrix4(elbowMatrix);
  M.translate(-0.05, 0.2, 0);  
  M.rotate(-120, 0, 0, 1);
  M.scale(0.15, 0.1, 0.15);
  gl.uniformMatrix4fv(u_ModelMatrix, false, M.elements);
  gl.uniform4f(u_FragColor, crabOrange[0], crabOrange[1], crabOrange[2], crabOrange[3]);
  drawTriangularPrism([0, 1, 0,   -0.75, -0.35, 0,   -2, -0.8, 0], 1.0);

  /* CLAWS - RIGHT */
  // right to upper arm
  M.setTranslate(0.5, -0.05, 0);
  M.rotate(20 + gClawShoulderRAngle, 0, 0, 1);
  var shoulderMatrixR = new Matrix4(M);  
  M.scale(0.25, 0.12, 0.12);
  drawCube(M, crabOrange);

  // right to forearm from shoulder joint
  M = new Matrix4(shoulderMatrixR);  
  M.translate(0.14, 0.08, 0); 
  M.rotate(-10 + gClawElbowRAngle, 0, 0, 1);  
  var elbowMatrixR = new Matrix4(M);  
  M.scale(0.1, 0.19, 0.15);
  drawCube(M, crabOrange);

  // right upper trianle
  M = new Matrix4(elbowMatrixR);
  M.translate(-0.07, 0.17, 0);  
  M.rotate(90 + gClawPincerRAngle, 0, 0, 1);  
  M.scale(0.15, 0.1, 0.15);
  gl.uniformMatrix4fv(u_ModelMatrix, false, M.elements);
  gl.uniform4f(u_FragColor, crabOrange[0], crabOrange[1], crabOrange[2], crabOrange[3]);
  drawTriangularPrism([0, -1, 0,   0.75, 0.35, 0,   2, 0.8, 0], 1.0);

  // right lower triangle 
  M = new Matrix4(elbowMatrixR);
  M.translate(0.15, 0.15, 0);  
  M.rotate(120, 0, 0, 1);
  M.scale(0.15, 0.1, 0.15);
  gl.uniformMatrix4fv(u_ModelMatrix, false, M.elements);
  gl.uniform4f(u_FragColor, crabOrange[0], crabOrange[1], crabOrange[2], crabOrange[3]);
  drawTriangularPrism([0, 1, 0,   0.75, -0.35, 0,   2, -0.8, 0], 1.0);

  /* LEGS - LEFT */
  // back left leg
  M.setTranslate(-0.51, -0.11, 0.1);
  M.rotate(-121, 0, 0, 1);
  M.scale(0.20, 0.10, 0.09);
  drawCube(M, upperLegColor);

  M.setTranslate(-0.57, -0.30, 0.15);
  M.rotate(150, 0, 0, 1);
  M.scale(0.05, 0.13, 0.05);
  drawCylinder(M, lowerLegColor);

  // middle left upper
  M.setTranslate(-0.51, -0.11, -0.1);
  M.rotate(-121, 0, 0, 1);
  M.scale(0.20, 0.10, 0.09);
  drawCube(M, upperLegColor);

  M.setTranslate(-0.57, -0.30, -0.05);
  M.rotate(150, 0, 0, 1);
  M.scale(0.05, 0.13, 0.05);
  drawCylinder(M, lowerLegColor);

  // front left to upper 
  M.setTranslate(-0.51, -0.11, -0.3);
  M.rotate(-121 + gLegHipAngle, 0, 0, 1);  
  var hipMatrix = new Matrix4(M);  
  M.scale(0.20, 0.10, 0.09);
  drawCube(M, upperLegColor);

  // front left lower
  M = new Matrix4(hipMatrix);  
  M.translate(0.162, 0.047, 0.05);  
  M.rotate(271 + gLegKneeAngle, 0, 0, 1);  
  M.scale(0.05, 0.16, 0.05);
  drawCylinder(M, lowerLegColor);

  // RIGHT LEGS
  // front right leg - upper
  M.setTranslate(0.43, -0.17, 0.1);
  M.rotate(-50, 0, 0, 1);
  M.scale(0.20, 0.10, 0.09);
  drawCube(M, upperLegColor);

  // front right leg - lower
  M.setTranslate(0.60, -0.29, 0.145);
  M.rotate(-140, 0, 0, 1);
  M.scale(0.05, 0.13, 0.05);
  drawCylinder(M, lowerLegColor);

  // middle right leg - upper
  M.setTranslate(0.43, -0.17, -0.1);
  M.rotate(-50, 0, 0, 1);
  M.scale(0.20, 0.10, 0.09);
  drawCube(M, upperLegColor);

  // middle right leg - lower
  M.setTranslate(0.60, -0.29, -0.055);
  M.rotate(-140, 0, 0, 1);
  M.scale(0.05, 0.13, 0.05);
  drawCylinder(M, lowerLegColor);

  // back right leg - upper
  M.setTranslate(0.43, -0.17, -0.3);
  M.rotate(-50, 0, 0, 1);
  M.scale(0.20, 0.10, 0.09);
  drawCube(M, upperLegColor);

  // back right lower leg
  M.setTranslate(0.60, -0.29, -0.255);
  M.rotate(-140, 0, 0, 1);
  M.scale(0.05, 0.13, 0.05);
  drawCylinder(M, lowerLegColor);
}

function main() {
    setupWebGL();
    if (!gl) {
        console.error('Failed to setup WebGL');
        return;
    }
    
    if (!connectVariablesToGLSL()) {
        console.error('Failed to connect variables to GLSL');
        return;
    }

    gl.clearColor(0.925, 0.961, 1.0, 1.0); 

    document.getElementById('globalRotationSlider').addEventListener('input', function() {
        gAnimalGlobalRotation = parseFloat(this.value);
        document.getElementById('cameraAngleValue').innerText = this.value;
        renderScene();
    });

    document.getElementById('clawShoulderSlider').addEventListener('input', function() {
        gClawShoulderAngle = parseFloat(this.value);
        document.getElementById('clawShoulderValue').innerText = this.value;
        renderScene();
    });

    document.getElementById('clawElbowSlider').addEventListener('input', function() {
        gClawElbowAngle = parseFloat(this.value);
        document.getElementById('clawElbowValue').innerText = this.value;
        renderScene();
    });

    document.getElementById('clawShoulderRSlider').addEventListener('input', function() {
        gClawShoulderRAngle = parseFloat(this.value);
        document.getElementById('clawShoulderRValue').innerText = this.value;
        renderScene();
    });

    document.getElementById('clawElbowRSlider').addEventListener('input', function() {
        gClawElbowRAngle = parseFloat(this.value);
        document.getElementById('clawElbowRValue').innerText = this.value;
        renderScene();
    });

    document.getElementById('clawPincerRSlider').addEventListener('input', function() {
        gClawPincerRAngle = parseFloat(this.value);
        document.getElementById('clawPincerRValue').innerText = this.value;
        renderScene();
    });

    document.getElementById('legHipSlider').addEventListener('input', function() {
        gLegHipAngle = parseFloat(this.value);
        document.getElementById('legHipValue').innerText = this.value;
        renderScene();
    });

    document.getElementById('legKneeSlider').addEventListener('input', function() {
        gLegKneeAngle = parseFloat(this.value);
        document.getElementById('legKneeValue').innerText = this.value;
        renderScene();
    });

    // animation  button
    document.getElementById('animationToggle').addEventListener('click', function() {
        g_animationEnabled = !g_animationEnabled;
        this.innerText = g_animationEnabled ? 'Turn Animation Off' : 'Turn Animation On';
    });

    // mouse control for rotation and poke animation
    canvas.addEventListener('mousedown', function(event) {
        if (event.shiftKey) {
            g_pokeActive = true;
            g_pokeStartTime = performance.now();
        } else {
            g_isDragging = true;
            g_lastMouseX = event.clientX;
        }
    });

    canvas.addEventListener('mousemove', function(event) {
        if (g_isDragging) {
            var deltaX = event.clientX - g_lastMouseX;
            gAnimalGlobalRotation += deltaX * 0.5;  
            gAnimalGlobalRotation = gAnimalGlobalRotation % 360;
            if (gAnimalGlobalRotation < 0) gAnimalGlobalRotation += 360;
            document.getElementById('globalRotationSlider').value = gAnimalGlobalRotation;
            document.getElementById('cameraAngleValue').innerText = Math.round(gAnimalGlobalRotation);
            
            g_lastMouseX = event.clientX;
        }
    });

    canvas.addEventListener('mouseup', function(event) {
        g_isDragging = false;
    });

    canvas.addEventListener('mouseleave', function(event) {
        g_isDragging = false;
    });

    renderScene();
    tick(); 
}


function updateAnimationAngles() {
    if (g_animationEnabled) {
        gClawShoulderAngle = 30 * Math.sin(g_time * 0.05); 
        gClawElbowAngle = 20 * Math.sin(g_time * 0.08);
        gClawShoulderRAngle = 30 * Math.sin(g_time * 0.05 + Math.PI);
        gClawElbowRAngle = 20 * Math.sin(g_time * 0.08 + Math.PI);
    }
}

function tick() {
    var currentTime = performance.now();
    g_frameCount++;
    var timeSinceLastUpdate = currentTime - g_lastFpsUpdate;
    
    if (timeSinceLastUpdate >= g_fpsUpdateInterval) {
        g_fps = Math.round((g_frameCount / timeSinceLastUpdate) * 1000);
        document.getElementById('fpsValue').innerText = g_fps;
        g_frameCount = 0;
        g_lastFpsUpdate = currentTime;
    }
    
    g_time = currentTime / 10; 
    updateAnimationAngles(); 
    renderScene();
    requestAnimationFrame(tick); 
}
