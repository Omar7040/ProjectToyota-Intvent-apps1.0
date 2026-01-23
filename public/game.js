// Game State
const gameState = {
    currentScreen: 'main-menu',
    playerCars: [],
    selectedCarIndex: 0,
    carsFound: 0,
    racesWon: 0,
    gameRunning: false,
    isPaused: false
};

// Player Object
const player = {
    x: 400,
    y: 300,
    width: 30,
    height: 50,
    color: 'red',
    speed: 0,
    maxSpeed: 5,
    acceleration: 0.2,
    friction: 0.1,
    angle: 0,
    engineLevel: 1
};

// Street Cars (collectible cars in the city)
const streetCars = [];

// City Buildings
const buildings = [];

// Canvas and context
let canvas, ctx;

// Keys pressed
const keys = {};

// Initialize game
function init() {
    // Add initial player car
    gameState.playerCars.push({
        id: 1,
        model: 'Toyota Camry',
        color: 'red',
        engineLevel: 1,
        maxSpeed: 5
    });

    // Generate city layout
    generateCity();
    
    // Generate street cars to collect
    generateStreetCars();

    // Update garage display
    updateGarageDisplay();
}

// Generate city buildings
function generateCity() {
    buildings.length = 0;
    
    // Create a grid of buildings with streets
    for (let i = 0; i < 5; i++) {
        for (let j = 0; j < 4; j++) {
            buildings.push({
                x: i * 160 + 10,
                y: j * 150 + 10,
                width: 130,
                height: 120,
                color: `hsl(${Math.random() * 60 + 180}, 50%, ${Math.random() * 20 + 40}%)`
            });
        }
    }
}

// Generate street cars to collect
function generateStreetCars() {
    streetCars.length = 0;
    
    const carModels = ['Toyota Corolla', 'Toyota RAV4', 'Toyota Supra', 'Toyota Camry', 'Toyota Highlander'];
    const colors = ['red', 'blue', 'green', 'yellow', 'black', 'white', 'silver'];
    
    for (let i = 0; i < 10; i++) {
        let x, y;
        let validPosition = false;
        
        // Find a position on a street (not inside a building)
        while (!validPosition) {
            x = Math.random() * 750 + 25;
            y = Math.random() * 550 + 25;
            
            validPosition = !isInsideBuilding(x, y);
        }
        
        streetCars.push({
            x: x,
            y: y,
            width: 30,
            height: 50,
            model: carModels[Math.floor(Math.random() * carModels.length)],
            color: colors[Math.floor(Math.random() * colors.length)],
            collected: false,
            engineLevel: Math.floor(Math.random() * 3) + 1
        });
    }
}

// Check if position is inside a building
function isInsideBuilding(x, y) {
    for (let building of buildings) {
        if (x > building.x && x < building.x + building.width &&
            y > building.y && y < building.y + building.height) {
            return true;
        }
    }
    return false;
}

// Screen navigation
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
    gameState.currentScreen = screenId;
}

function showMainMenu() {
    gameState.gameRunning = false;
    showScreen('main-menu');
}

function showInstructions() {
    showScreen('instructions');
}

function showGarage() {
    updateGarageDisplay();
    showScreen('garage');
}

function startGame() {
    showScreen('game-screen');
    gameState.gameRunning = true;
    gameState.isPaused = false;
    
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');
    
    // Reset player position
    player.x = 400;
    player.y = 300;
    player.speed = 0;
    player.angle = 0;
    
    // Apply current car settings
    if (gameState.playerCars.length > 0) {
        const currentCar = gameState.playerCars[gameState.selectedCarIndex];
        player.color = currentCar.color;
        player.engineLevel = currentCar.engineLevel;
        player.maxSpeed = 3 + (currentCar.engineLevel * 2);
    }
    
    gameLoop();
}

// Update garage display
function updateGarageDisplay() {
    const carList = document.getElementById('car-list');
    carList.innerHTML = '';
    
    gameState.playerCars.forEach((car, index) => {
        const carCard = document.createElement('div');
        carCard.className = 'car-card';
        if (index === gameState.selectedCarIndex) {
            carCard.classList.add('selected');
        }
        
        carCard.innerHTML = `
            <h4>${car.model}</h4>
            <p>Color: <span style="color: ${car.color}">█</span> ${car.color}</p>
            <p>Motor: Nivel ${car.engineLevel}</p>
            <p>Vel. Máx: ${3 + (car.engineLevel * 2)} km/h</p>
        `;
        
        carCard.onclick = () => selectCar(index);
        carList.appendChild(carCard);
    });
    
    // Update modification panel
    if (gameState.playerCars.length > 0) {
        const selectedCar = gameState.playerCars[gameState.selectedCarIndex];
        document.getElementById('selected-car-info').innerHTML = `
            <h4>Auto Seleccionado: ${selectedCar.model}</h4>
            <p>Color actual: ${selectedCar.color}</p>
            <p>Motor actual: Nivel ${selectedCar.engineLevel}</p>
        `;
        document.getElementById('modification-options').style.display = 'block';
    }
}

// Select car in garage
function selectCar(index) {
    gameState.selectedCarIndex = index;
    updateGarageDisplay();
}

// Modify car color
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.onclick = () => {
            const color = btn.dataset.color;
            if (gameState.playerCars.length > 0) {
                gameState.playerCars[gameState.selectedCarIndex].color = color;
                updateGarageDisplay();
                showMessage('¡Color de carrocería cambiado!');
            }
        };
    });
    
    document.querySelectorAll('.engine-btn').forEach(btn => {
        btn.onclick = () => {
            const level = parseInt(btn.dataset.level);
            if (gameState.playerCars.length > 0) {
                gameState.playerCars[gameState.selectedCarIndex].engineLevel = level;
                gameState.playerCars[gameState.selectedCarIndex].maxSpeed = 3 + (level * 2);
                updateGarageDisplay();
                showMessage('¡Motor actualizado!');
            }
        };
    });
    
    init();
});

// Show temporary message
function showMessage(text) {
    const messageEl = document.getElementById('hud-message');
    if (messageEl) {
        messageEl.textContent = text;
        messageEl.classList.add('active');
        setTimeout(() => {
            messageEl.classList.remove('active');
        }, 3000);
    }
}

// Keyboard controls
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    
    if (e.key === 'Escape' && gameState.gameRunning) {
        gameState.isPaused = !gameState.isPaused;
        if (gameState.isPaused) {
            showMessage('PAUSA - Presiona ESC para continuar');
        }
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

// Game loop
function gameLoop() {
    if (!gameState.gameRunning) return;
    
    if (!gameState.isPaused) {
        updateGame();
        renderGame();
    }
    
    requestAnimationFrame(gameLoop);
}

// Update game state
function updateGame() {
    // Handle input
    let moving = false;
    
    if (keys['ArrowUp'] || keys['w'] || keys['W']) {
        player.speed = Math.min(player.speed + player.acceleration, player.maxSpeed);
        moving = true;
    }
    
    if (keys['ArrowDown'] || keys['s'] || keys['S']) {
        player.speed = Math.max(player.speed - player.acceleration, -player.maxSpeed / 2);
        moving = true;
    }
    
    if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
        player.angle -= 0.05;
    }
    
    if (keys['ArrowRight'] || keys['d'] || keys['D']) {
        player.angle += 0.05;
    }
    
    if (keys[' ']) {
        player.speed *= 0.9; // Braking
    }
    
    // Apply friction
    if (!moving) {
        player.speed *= (1 - player.friction);
    }
    
    // Calculate new position
    const newX = player.x + Math.sin(player.angle) * player.speed;
    const newY = player.y - Math.cos(player.angle) * player.speed;
    
    // Check collision with buildings
    if (!isInsideBuilding(newX, newY)) {
        player.x = newX;
        player.y = newY;
    } else {
        player.speed = 0; // Stop if hitting building
    }
    
    // Keep player in bounds
    player.x = Math.max(15, Math.min(canvas.width - 15, player.x));
    player.y = Math.max(25, Math.min(canvas.height - 25, player.y));
    
    // Check collision with street cars
    for (let car of streetCars) {
        if (!car.collected) {
            const dx = player.x - car.x;
            const dy = player.y - car.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 40) {
                collectCar(car);
            }
        }
    }
    
    // Update HUD
    document.getElementById('speed').textContent = Math.abs(Math.round(player.speed * 20));
    document.getElementById('cars-found').textContent = gameState.carsFound;
    document.getElementById('races-won').textContent = gameState.racesWon;
}

// Collect a street car
function collectCar(car) {
    car.collected = true;
    gameState.carsFound++;
    
    // Add to player's garage
    gameState.playerCars.push({
        id: gameState.playerCars.length + 1,
        model: car.model,
        color: car.color,
        engineLevel: car.engineLevel,
        maxSpeed: 3 + (car.engineLevel * 2)
    });
    
    showMessage(`¡Auto encontrado! ${car.model}`);
    
    // Check if all cars collected - trigger race
    const uncollectedCars = streetCars.filter(c => !c.collected);
    if (uncollectedCars.length === 0) {
        setTimeout(() => {
            showMessage('¡Todos los autos encontrados! ¡Preparando carrera!');
            setTimeout(() => {
                startRace();
            }, 2000);
        }, 1000);
    }
}

// Render game
function renderGame() {
    // Clear canvas
    ctx.fillStyle = '#34495e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw streets (background)
    ctx.fillStyle = '#555555';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw street lines
    ctx.strokeStyle = '#FFD700';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 10]);
    
    // Vertical lines
    for (let i = 1; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(i * 160, 0);
        ctx.lineTo(i * 160, canvas.height);
        ctx.stroke();
    }
    
    // Horizontal lines
    for (let i = 1; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * 150);
        ctx.lineTo(canvas.width, i * 150);
        ctx.stroke();
    }
    
    ctx.setLineDash([]);
    
    // Draw buildings
    for (let building of buildings) {
        ctx.fillStyle = building.color;
        ctx.fillRect(building.x, building.y, building.width, building.height);
        
        // Windows
        ctx.fillStyle = 'rgba(255, 255, 200, 0.8)';
        for (let i = 0; i < 3; i++) {
            for (let j = 0; j < 4; j++) {
                ctx.fillRect(
                    building.x + 10 + i * 40,
                    building.y + 10 + j * 25,
                    15, 15
                );
            }
        }
    }
    
    // Draw street cars
    for (let car of streetCars) {
        if (!car.collected) {
            ctx.save();
            ctx.translate(car.x, car.y);
            
            // Car body
            ctx.fillStyle = car.color;
            ctx.fillRect(-car.width / 2, -car.height / 2, car.width, car.height);
            
            // Windshield
            ctx.fillStyle = 'rgba(200, 200, 255, 0.6)';
            ctx.fillRect(-car.width / 2 + 5, -car.height / 2 + 5, car.width - 10, 15);
            
            // Sparkle effect
            ctx.fillStyle = 'yellow';
            ctx.beginPath();
            ctx.arc(0, -car.height / 2 - 10, 5, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.restore();
        }
    }
    
    // Draw player car
    ctx.save();
    ctx.translate(player.x, player.y);
    ctx.rotate(player.angle);
    
    // Car body
    ctx.fillStyle = player.color;
    ctx.fillRect(-player.width / 2, -player.height / 2, player.width, player.height);
    
    // Windshield
    ctx.fillStyle = 'rgba(200, 200, 255, 0.6)';
    ctx.fillRect(-player.width / 2 + 5, -player.height / 2 + 5, player.width - 10, 15);
    
    // Wheels
    ctx.fillStyle = '#333';
    ctx.fillRect(-player.width / 2 - 3, -player.height / 2 + 10, 4, 10);
    ctx.fillRect(player.width / 2 - 1, -player.height / 2 + 10, 4, 10);
    ctx.fillRect(-player.width / 2 - 3, player.height / 2 - 20, 4, 10);
    ctx.fillRect(player.width / 2 - 1, player.height / 2 - 20, 4, 10);
    
    ctx.restore();
}

// Start a race
function startRace() {
    gameState.gameRunning = false;
    showScreen('race-screen');
    
    const raceCanvas = document.getElementById('race-canvas');
    const raceCtx = raceCanvas.getContext('2d');
    
    let raceProgress = 0;
    const raceCars = [
        { name: 'Tú', position: 0, speed: 5 + Math.random() * 2, color: player.color },
        { name: 'Rival 1', position: 0, speed: 4 + Math.random() * 3, color: 'blue' },
        { name: 'Rival 2', position: 0, speed: 4 + Math.random() * 3, color: 'green' },
        { name: 'Rival 3', position: 0, speed: 4 + Math.random() * 3, color: 'yellow' }
    ];
    
    let raceTime = 0;
    const raceInterval = setInterval(() => {
        raceTime++;
        
        // Update race
        raceCars.forEach(car => {
            car.position += car.speed + Math.random() * 2 - 1;
        });
        
        // Sort by position
        raceCars.sort((a, b) => b.position - a.position);
        
        // Render race
        raceCtx.fillStyle = '#555';
        raceCtx.fillRect(0, 0, raceCanvas.width, raceCanvas.height);
        
        // Draw track
        raceCtx.fillStyle = '#333';
        raceCtx.fillRect(100, 0, 600, raceCanvas.height);
        
        // Draw lanes
        raceCtx.strokeStyle = '#FFD700';
        raceCtx.lineWidth = 2;
        raceCtx.setLineDash([20, 20]);
        for (let i = 1; i < 4; i++) {
            raceCtx.beginPath();
            raceCtx.moveTo(100 + i * 150, 0);
            raceCtx.lineTo(100 + i * 150, raceCanvas.height);
            raceCtx.stroke();
        }
        raceCtx.setLineDash([]);
        
        // Draw cars
        raceCars.forEach((car, index) => {
            const lane = index * 150 + 175;
            const yPos = 500 - (car.position % 500);
            
            raceCtx.fillStyle = car.color;
            raceCtx.fillRect(lane - 20, yPos, 40, 60);
            
            raceCtx.fillStyle = 'white';
            raceCtx.font = '12px Arial';
            raceCtx.fillText(car.name, lane - 25, yPos - 10);
        });
        
        // Update HUD
        const playerRank = raceCars.findIndex(car => car.name === 'Tú') + 1;
        document.getElementById('race-position').textContent = playerRank;
        document.getElementById('total-racers').textContent = raceCars.length;
        document.getElementById('race-time').textContent = `${Math.floor(raceTime / 60)}:${(raceTime % 60).toString().padStart(2, '0')}`;
        
        // Check finish
        if (raceCars[0].position > 1500) {
            clearInterval(raceInterval);
            
            if (raceCars[0].name === 'Tú') {
                gameState.racesWon++;
                document.getElementById('race-info').innerHTML = '<h3 style="color: #2ecc71;">¡GANASTE LA CARRERA! 🏆</h3>';
            } else {
                document.getElementById('race-info').innerHTML = `<h3 style="color: #e74c3c;">Quedaste en ${playerRank}° lugar</h3>`;
            }
            
            setTimeout(() => {
                showMainMenu();
                // Regenerate street cars for new game
                generateStreetCars();
            }, 3000);
        }
    }, 50);
}
