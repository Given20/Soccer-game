// Get canvas and context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size based on window size
canvas.width = 800;
canvas.height = 500;

// Game elements
const scoreBoard = document.getElementById('scoreBoard');
const gameMenu = document.getElementById('gameMenu');
const startButton = document.getElementById('startButton');
const gameControls = document.getElementById('gameControls');

// Game state
let gameRunning = false;
let scores = { teamA: 0, teamB: 0 };
let lastGoalTime = 0;
let showGoalMessage = false;
let goalMessageText = '';

// Field dimensions
const field = {
    width: canvas.width,
    height: canvas.height,
    centerCircleRadius: 60,
    goalWidth: 100,
    goalDepth: 20,
    penalty: { width: 150, height: 80 }
};

// Player properties
const player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 15,
    speed: 4,
    color: '#FF0000',
    team: 'teamA',
    hasBall: false
};

// AI players
const aiPlayers = [
    {
        x: canvas.width / 2 - 100,
        y: canvas.height / 2 - 100,
        radius: 15,
        speed: 2,
        color: '#FF0000',
        team: 'teamA'
    },
    {
        x: canvas.width / 2 + 100,
        y: canvas.height / 2 - 100,
        radius: 15,
        speed: 2,
        color: '#0000FF',
        team: 'teamB'
    },
    {
        x: canvas.width / 2 + 100,
        y: canvas.height / 2 + 100,
        radius: 15,
        speed: 2,
        color: '#0000FF',
        team: 'teamB'
    }
];

// Ball properties
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 8,
    speed: 0,
    dx: 0,
    dy: 0,
    friction: 0.98,
    maxSpeed: 8,
    color: '#FFFFFF'
};

// Player & ball sprites
const playerA = new Image();
playerA.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MCA1MCI+PGNpcmNsZSBjeD0iMjUiIGN5PSIyNSIgcj0iMjQiIGZpbGw9IiNGRjAwMDAiLz48Y2lyY2xlIGN4PSIyNSIgY3k9IjI1IiByPSIyMCIgZmlsbD0iI0ZGRkZGRiIgZmlsbC1vcGFjaXR5PSIwLjMiLz48L3N2Zz4=';

const playerB = new Image();
playerB.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA1MCA1MCI+PGNpcmNsZSBjeD0iMjUiIGN5PSIyNSIgcj0iMjQiIGZpbGw9IiMwMDAwRkYiLz48Y2lyY2xlIGN4PSIyNSIgY3k9IjI1IiByPSIyMCIgZmlsbD0iI0ZGRkZGRiIgZmlsbC1vcGFjaXR5PSIwLjMiLz48L3N2Zz4=';

const ballImg = new Image();
ballImg.src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMCAzMCI+PGNpcmNsZSBjeD0iMTUiIGN5PSIxNSIgcj0iMTQiIGZpbGw9IiNGRkZGRkYiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLXdpZHRoPSIxIi8+PHBhdGggZD0iTTE1IDEgTDIwIDEwIEwyOSAxMiBMMjMgMjAgTDI1IDMwIEwxNSAyNSBMNSAzMCBMNyAyMCBMMSAxMiBMMTAgMTAgWiIgZmlsbD0iIzAwMCIgZmlsbC1vcGFjaXR5PSIwLjMiLz48L3N2Zz4=';

// Controls state
const keys = {
    w: false,
    a: false,
    s: false,
    d: false,
    space: false,
    r: false
};

// Event listeners for keyboard
document.addEventListener('keydown', (e) => {
    if (e.key === 'w' || e.key === 'W') keys.w = true;
    if (e.key === 'a' || e.key === 'A') keys.a = true;
    if (e.key === 's' || e.key === 'S') keys.s = true;
    if (e.key === 'd' || e.key === 'D') keys.d = true;
    if (e.key === ' ') keys.space = true;
    if (e.key === 'r' || e.key === 'R') keys.r = true;
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'w' || e.key === 'W') keys.w = false;
    if (e.key === 'a' || e.key === 'A') keys.a = false;
    if (e.key === 's' || e.key === 'S') keys.s = false;
    if (e.key === 'd' || e.key === 'D') keys.d = false;
    if (e.key === ' ') keys.space = false;
    if (e.key === 'r' || e.key === 'R') keys.r = false;
});

// Start game
startButton.addEventListener('click', () => {
    gameMenu.style.display = 'none';
    gameRunning = true;
    resetPositions();
    gameLoop();
});

// Reset positions
function resetPositions() {
    player.x = canvas.width / 2;
    player.y = canvas.height / 2 + 50;
    player.hasBall = false;
    
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = 0;
    ball.dy = 0;
    ball.speed = 0;
    
    aiPlayers[0].x = canvas.width / 2 - 100;
    aiPlayers[0].y = canvas.height / 2 - 100;
    
    aiPlayers[1].x = canvas.width / 2 + 100;
    aiPlayers[1].y = canvas.height / 2 - 100;
    
    aiPlayers[2].x = canvas.width / 2 + 100;
    aiPlayers[2].y = canvas.height / 2 + 100;
}

// Reset after goal
function resetAfterGoal() {
    resetPositions();
    lastGoalTime = Date.now();
    showGoalMessage = true;
}

// Game loop
function gameLoop() {
    if (!gameRunning) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw field
    drawField();
    
    // Handle inputs
    handleControls();
    
    // Update and draw players
    drawPlayers();
    
    // Update and draw ball
    updateBall();
    drawBall();
    
    // Check for goal
    checkGoal();
    
    // Check for ball possession
    checkBallPossession();
    
    // Update AI players
    updateAIPlayers();
    
    // Draw goal message if needed
    if (showGoalMessage) {
        drawGoalMessage();
        if (Date.now() - lastGoalTime > 2000) {
            showGoalMessage = false;
        }
    }
    
    // Continue game loop
    requestAnimationFrame(gameLoop);
}

// Handle player controls
function handleControls() {
    // Player movement
    if (keys.w && player.y - player.radius > 0) {
        player.y -= player.speed;
    }
    if (keys.s && player.y + player.radius < canvas.height) {
        player.y += player.speed;
    }
    if (keys.a && player.x - player.radius > 0) {
        player.x -= player.speed;
    }
    if (keys.d && player.x + player.radius < canvas.width) {
        player.x += player.speed;
    }
    
    // Ball control
    if (player.hasBall) {
        ball.x = player.x + (player.radius + ball.radius) * 0.8;
        ball.y = player.y;
    }
    
    // Kick the ball
    if (keys.space && player.hasBall) {
        let kickPower = 7;
        let kickAngle = 0;
        
        // Determine kick direction based on player movement
        if (keys.w) kickAngle -= Math.PI / 2;
        if (keys.s) kickAngle += Math.PI / 2;
        if (keys.a) kickAngle += Math.PI;
        if (keys.d) kickAngle += 0;
        
        // Kick at 45 degree if diagonal
        if (keys.w && keys.d) kickAngle = -Math.PI / 4;
        if (keys.w && keys.a) kickAngle = -3 * Math.PI / 4;
        if (keys.s && keys.d) kickAngle = Math.PI / 4;
        if (keys.s && keys.a) kickAngle = 3 * Math.PI / 4;
        
        // Default direction if no keys are pressed
        if (!keys.w && !keys.a && !keys.s && !keys.d) {
            kickAngle = 0;
        }
        
        ball.dx = Math.cos(kickAngle) * kickPower;
        ball.dy = Math.sin(kickAngle) * kickPower;
        player.hasBall = false;
    }
    
    // Reset ball position
    if (keys.r) {
        ball.x = canvas.width / 2;
        ball.y = canvas.height / 2;
        ball.dx = 0;
        ball.dy = 0;
        player.hasBall = false;
    }
}

// Update ball physics
function updateBall() {
    if (!player.hasBall) {
        // Apply friction
        ball.dx *= ball.friction;
        ball.dy *= ball.friction;
        
        // Update position
        ball.x += ball.dx;
        ball.y += ball.dy;
        
        // Wall collisions
        if (ball.x - ball.radius < 0) {
            if (ball.y > (canvas.height / 2 - field.goalWidth / 2) && 
                ball.y < (canvas.height / 2 + field.goalWidth / 2)) {
                // Ball went past goal line
                if (ball.x < -field.goalDepth) {
                    // Goal for team B
                    scores.teamB++;
                    scoreBoard.textContent = `Team A: ${scores.teamA} - Team B: ${scores.teamB}`;
                    goalMessageText = 'GOAL FOR TEAM B!';
                    resetAfterGoal();
                }
            } else {
                ball.x = ball.radius;
                ball.dx = -ball.dx * 0.7;
            }
        }
        
        if (ball.x + ball.radius > canvas.width) {
            if (ball.y > (canvas.height / 2 - field.goalWidth / 2) && 
                ball.y < (canvas.height / 2 + field.goalWidth / 2)) {
                // Ball went past goal line
                if (ball.x > canvas.width + field.goalDepth) {
                    // Goal for team A
                    scores.teamA++;
                    scoreBoard.textContent = `Team A: ${scores.teamA} - Team B: ${scores.teamB}`;
                    goalMessageText = 'GOAL FOR TEAM A!';
                    resetAfterGoal();
                }
            } else {
                ball.x = canvas.width - ball.radius;
                ball.dx = -ball.dx * 0.7;
            }
        }
        
        if (ball.y - ball.radius < 0) {
            ball.y = ball.radius;
            ball.dy = -ball.dy * 0.7;
        }
        
        if (ball.y + ball.radius > canvas.height) {
            ball.y = canvas.height - ball.radius;
            ball.dy = -ball.dy * 0.7;
        }
        
        // Stop ball if it's moving very slow
        if (Math.abs(ball.dx) < 0.1) ball.dx = 0;
        if (Math.abs(ball.dy) < 0.1) ball.dy = 0;
    }
}

// Check for ball possession
function checkBallPossession() {
    // Check if any player is close to the ball
    const dist = Math.sqrt((player.x - ball.x) ** 2 + (player.y - ball.y) ** 2);
    
    if (dist < player.radius + ball.radius + 2 && !player.hasBall && 
        Math.abs(ball.dx) < 1 && Math.abs(ball.dy) < 1) {
        player.hasBall = true;
    }
    
    // AI players can also get the ball
    for (let ai of aiPlayers) {
        const aiDist = Math.sqrt((ai.x - ball.x) ** 2 + (ai.y - ball.y) ** 2);
        if (aiDist < ai.radius + ball.radius + 2 && !player.hasBall && 
            Math.abs(ball.dx) < 1 && Math.abs(ball.dy) < 1) {
            
            // AI kicks the ball towards the goal
            const targetX = ai.team === 'teamA' ? canvas.width : 0;
            const targetY = canvas.height / 2;
            
            const angle = Math.atan2(targetY - ai.y, targetX - ai.x);
            const kickPower = 5 + Math.random() * 2;
            
            ball.dx = Math.cos(angle) * kickPower;
            ball.dy = Math.sin(angle) * kickPower;
        }
    }
}

// Update AI player movement
function updateAIPlayers() {
    for (let ai of aiPlayers) {
        const targetX = ball.x;
        const targetY = ball.y;
        
        // Simple AI: move towards the ball but maintain some distance
        const angle = Math.atan2(targetY - ai.y, targetX - ai.x);
        
        // Move AI player
        ai.x += Math.cos(angle) * ai.speed * 0.5;
        ai.y += Math.sin(angle) * ai.speed * 0.5;
        
        // Keep AI players within boundaries
        ai.x = Math.max(ai.radius, Math.min(canvas.width - ai.radius, ai.x));
        ai.y = Math.max(ai.radius, Math.min(canvas.height - ai.radius, ai.y));
        
        // Avoid player collision
        const playerDist = Math.sqrt((ai.x - player.x) ** 2 + (ai.y - player.y) ** 2);
        if (playerDist < ai.radius + player.radius) {
            const pushAngle = Math.atan2(ai.y - player.y, ai.x - player.x);
            ai.x += Math.cos(pushAngle) * 2;
            ai.y += Math.sin(pushAngle) * 2;
        }
        
        // Avoid other AI collisions
        for (let otherAi of aiPlayers) {
            if (ai !== otherAi) {
                const aiDist = Math.sqrt((ai.x - otherAi.x) ** 2 + (ai.y - otherAi.y) ** 2);
                if (aiDist < ai.radius + otherAi.radius) {
                    const pushAngle = Math.atan2(ai.y - otherAi.y, ai.x - otherAi.x);
                    ai.x += Math.cos(pushAngle);
                    ai.y += Math.sin(pushAngle);
                }
            }
        }
    }
}

// Check for goals
function checkGoal() {
    // Left goal (Team A defends)
    if (ball.x < 0 && 
        ball.y > canvas.height / 2 - field.goalWidth / 2 && 
        ball.y < canvas.height / 2 + field.goalWidth / 2) {
        // Goal for Team B!
    }
    
    // Right goal (Team B defends)
    if (ball.x > canvas.width && 
        ball.y > canvas.height / 2 - field.goalWidth / 2 && 
        ball.y < canvas.height / 2 + field.goalWidth / 2) {
        // Goal for Team A!
    }
}

// Draw field
function drawField() {
    // Field background
    ctx.fillStyle = '#0a6e0a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Centerline
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Center circle
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, field.centerCircleRadius, 0, Math.PI * 2);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Center dot
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 3, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
    
    // Draw left goal
    drawGoal(0, canvas.height / 2, -1);
    
    // Draw right goal
    drawGoal(canvas.width, canvas.height / 2, 1);
    
    // Draw penalty areas
    drawPenaltyArea(0, 1);
    drawPenaltyArea(canvas.width, -1);
    
    // Draw field texture (grass lines)
    drawGrassTexture();
}

// Draw grass texture
function drawGrassTexture() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    
    // Vertical lines
    for (let x = 0; x < canvas.width; x += 20) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
}

// Draw goal
function drawGoal(x, y, direction) {
    // Goal posts
    ctx.fillStyle = 'white';
    
    // Top post
    ctx.fillRect(
        x, 
        y - field.goalWidth / 2, 
        5 * direction, 
        5
    );
    
    // Bottom post
    ctx.fillRect(
        x, 
        y + field.goalWidth / 2 - 5, 
        5 * direction, 
        5
    );
    
    // Goal net
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1;
    
    // Draw net with lines
    for (let i = 0; i <= field.goalWidth; i += 10) {
        ctx.beginPath();
        ctx.moveTo(x, y - field.goalWidth / 2 + i);
        ctx.lineTo(x + field.goalDepth * direction, y - field.goalWidth / 2 + i);
        ctx.stroke();
    }
    
    for (let i = 0; i <= field.goalDepth; i += 5) {
        ctx.beginPath();
        ctx.moveTo(x + i * direction, y - field.goalWidth / 2);
        ctx.lineTo(x + i * direction, y + field.goalWidth / 2);
        ctx.stroke();
    }
}

// Draw penalty area
function drawPenaltyArea(x, direction) {
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    if (direction > 0) { // Left side
        ctx.rect(
            x - field.penalty.width, 
            canvas.height / 2 - field.penalty.height, 
            field.penalty.width, 
            field.penalty.height * 2
        );
    } else { // Right side
        ctx.rect(
            x,
            canvas.height / 2 - field.penalty.height,
            -field.penalty.width,
            field.penalty.height * 2
        );
    }
    
    ctx.stroke();
    
    // Penalty spot
    ctx.beginPath();
    ctx.arc(
        x - (field.penalty.width * 0.7) * direction,
        canvas.height / 2,
        3,
        0,
        Math.PI * 2
    );
    ctx.fillStyle = 'white';
    ctx.fill();
}

// Draw players
function drawPlayers() {
    // Draw main player
    ctx.drawImage(
        playerA,
        player.x - player.radius,
        player.y - player.radius,
        player.radius * 2,
        player.radius * 2
    );
    
    // Draw AI players
    for (let ai of aiPlayers) {
        ctx.drawImage(
            ai.team === 'teamA' ? playerA : playerB,
            ai.x - ai.radius,
            ai.y - ai.radius,
            ai.radius * 2,
            ai.radius * 2
        );
    }
}

// Draw ball
function drawBall() {
    ctx.drawImage(
        ballImg,
        ball.x - ball.radius,
        ball.y - ball.radius,
        ball.radius * 2,
        ball.radius * 2
    );
    
    // Draw ball shadow
    ctx.beginPath();
    ctx.ellipse(
        ball.x, 
        ball.y + ball.radius / 2, 
        ball.radius * 0.8, 
        ball.radius * 0.3, 
        0, 
        0, 
        Math.PI * 2
    );
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fill();
}

// Draw goal message
function drawGoalMessage() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(canvas.width / 2 - 150, canvas.height / 2 - 40, 300, 80);
    
    ctx.font = 'bold 30px Arial';
    ctx.fillStyle = '#FFD700';
    ctx.textAlign = 'center';
    ctx.fillText(goalMessageText, canvas.width / 2, canvas.height / 2 + 10);
}

// Initial draw
drawField();
