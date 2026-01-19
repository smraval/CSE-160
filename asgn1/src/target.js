// awesome game - target practice archery vibes 
let g_gameActive = false;
let g_gameScore = 0;
let g_targets = []; 
let g_gameInterval = null; 

// Spawn a random target
function spawnTarget() {
  if (!g_gameActive) return;
  
  let target = {
    x: (Math.random() * 1.6) - 0.8,  
    y: (Math.random() * 1.6) - 0.8,  
    radius: 0.08,
    spawnTime: Date.now(),
    color: [Math.random(), Math.random(), Math.random(), 1.0] 
  };
  
  g_targets.push(target);
}

function checkTargetHit(clickX, clickY) {
  if (!g_gameActive) return false;
  
  for (let i = g_targets.length - 1; i >= 0; i--) {
    let target = g_targets[i];
    let dx = clickX - target.x;
    let dy = clickY - target.y;
    let distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance < target.radius + 0.05) { 
      // Create white dot at hit location
      let whiteDot = new Point(target.x, target.y, [1.0, 1.0, 1.0, 1.0], 15);
      shapesList.push(whiteDot);
      
      g_targets.splice(i, 1); 
      g_gameScore += 10;
      updateScoreDisplay();
      return true;
    }
  }
  return false;
}

function removeOldTargets() {
  if (!g_gameActive) return;
  
  let currentTime = Date.now();
  g_targets = g_targets.filter(target => {
    return (currentTime - target.spawnTime) < 5000; 
  });
}

function drawTargets() {
  if (!g_gameActive) return;
  
  for (let i = 0; i < g_targets.length; i++) {
    let target = g_targets[i];
  
    let targetCircle = new Circle(target.x, target.y, target.color, target.radius * 100, 30);
    targetCircle.render();
  }
}

function startTargetGame() {
  g_gameActive = true;
  g_gameScore = 0;
  g_targets = [];
  updateScoreDisplay();
  
  g_gameInterval = setInterval(function() {
    spawnTarget();
    removeOldTargets();
  }, 2000);
  
  // Start game loop
  let gameLoop = setInterval(function() {
    if (!g_gameActive) {
      clearInterval(gameLoop);
      return;
    }
    renderAllShapes();
    drawTargets();
  }, 50); 
}

function stopTargetGame() {
  g_gameActive = false;
  g_targets = [];
  if (g_gameInterval) {
    clearInterval(g_gameInterval);
    g_gameInterval = null;
  }
  renderAllShapes();
  
  let scoreElement = document.getElementById('gameScore');
  if (scoreElement) {
    scoreElement.innerHTML = 'Score: ' + g_gameScore + ' | <span style="color: green;">Final Score: ' + g_gameScore + '</span>';
  }
}

function updateScoreDisplay() {
  let scoreElement = document.getElementById('gameScore');
  if (scoreElement) {
    scoreElement.textContent = 'Score: ' + g_gameScore;
  }
}

function initTargetGame() {
  document.getElementById('playGameButton').addEventListener('click', function() {
    startTargetGame();
  });

  document.getElementById('stopGameButton').addEventListener('click', function() {
    stopTargetGame();
  });
}
