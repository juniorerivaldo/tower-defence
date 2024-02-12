var canvas = /** @type {HTMLCanvasElement} */ (document.querySelector("#canvas"));
const ctx = canvas.getContext("2d");
canvas.width = 900;
canvas.height = 600;

/* global variables */
const cellSize = 100;
const cellGap = 3;
const gameGrid = [];
const defenders = [];
const enemies = [];
const enemiesPositions = [];
const gameOver = false;
let numberOfResources = 300; /* initial number to spawn defenders */
let enemiesInterval = 600;
let frame = 0;

// mouse
const mouse = {
	x: 10,
	y: 10,
	width: 0.1,
	height: 0.1,
};

let canvasPosition = canvas.getBoundingClientRect();
canvas.addEventListener("mousemove", function (e) {
	mouse.x = e.x - canvasPosition.left;
	mouse.y = e.y - canvasPosition.top;
});
canvas.addEventListener("mouseleave", function () {
	mouse.x = undefined;
	mouse.y = undefined;
});

canvas.addEventListener("click", function () {
	let defenderCost = 100;
	const gridPositionX = mouse.x - (mouse.x % cellSize);
	const gridPositionY = mouse.y - (mouse.y % cellSize);
	if (gridPositionY < cellSize) return; /* Do not allow click to put defenders on first row */
	for (let i = 0; i < defenders.length; i++) {
		if (defenders[i].x === gridPositionX && defenders[i].y === gridPositionY) {
			return; /*  not spawn defender on top of other defender */
		}
	}
	if (numberOfResources >= defenderCost) {
		defenders.push(new Defender(gridPositionX, gridPositionY));
		numberOfResources -= defenderCost;
	}
});

/* game board */
const controlsBar = {
	width: canvas.width,
	height: cellSize,
};

class Cell {
	/* BoilerPlate class for all cell's in the game like blueprint for instanciate new itens on each cell */
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.width = cellSize;
		this.height = cellSize;
	}
	draw() {
		if (mouse.x && mouse.y && collision(this, mouse)) {
			ctx.strokeStyle = "black";
			ctx.strokeRect(this.x, this.y, this.width, this.height);
		}
	}
}

function createGrid() {
	/* This method run each cell on grid by y and by x after create new Cell object and push it to gameGrid array */
	for (let y = cellSize; y < canvas.height; y += cellSize) {
		for (let x = 0; x < canvas.width; x += cellSize) {
			gameGrid.push(new Cell(x, y));
		}
	}
}

function handleGameGrid() {
	/* this method run each game object inside gameGrid and draw it on screen use Cell class draw method */
	for (let i = 0; i < gameGrid.length; i++) {
		gameGrid[i].draw();
	}
}

function handleDefenders() {
	for (let i = 0; i < defenders.length; i++) {
		defenders[i].draw();
		for(let j = 0; j < enemies.length; j++){
			if(defenders[i] && collision(defenders[i], enemies[j])){
				enemies[j].movement = 0;
				defenders[i].health -= 0.2;
			}
			if(defenders[i] && defenders[i].health <= 0){
				defenders.splice(i,1);
				i--;
				enemies[j].movement = enemies[j].speed;
			}
		}
	}
}

function handleEnemies() {
	for (let i = 0; i < enemies.length; i++) {
		enemies[i].update();
		enemies[i].draw();
		if (enemies[i].x < 0) {
			gameOver = true; /* case any enemy cross the border game is over */
		}
	}
	if (frame % enemiesInterval === 0) {
		let verticalPosition = Math.floor(Math.random() * 5 + 1) * cellSize;
		enemies.push(new Enemy(verticalPosition));
		enemiesPositions.push(verticalPosition);
		if (enemiesInterval > 120) enemiesInterval -= 100;
	}
}

/* projectiles */

/* defenders */
class Defender {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.width = cellSize;
		this.height = cellSize;
		this.shooting = false;
		this.health = 100;
		this.projectiles = [];
		this.timer = 0;
	}
	draw() {
		ctx.fillStyle = "blue";
		ctx.fillRect(this.x, this.y, this.width, this.height);
		ctx.fillStyle = "gold";
		ctx.font = "30px Arial";
		ctx.fillText(Math.floor(this.health), this.x + 25, this.y + 30);
	}
}

/* enemies */
class Enemy {
	constructor(verticalPosition) {
		this.x = canvas.width;
		this.y = verticalPosition;
		this.width = cellSize;
		this.height = cellSize;
		this.speed = Math.random() * 0.2 + 0.4;
		this.movement = this.speed;
		this.health = 200;
		this.maxHealth = this.health;
		this.verticalPosition = verticalPosition; /* validar depois se da para usar isso dentro da classe ao inves de criar um novo array só para dar push no position de cada enemi */
	}
	update() {
		this.x -= this.movement;
	}
	draw() {
		ctx.fillStyle = "red";
		ctx.fillRect(this.x, this.y, this.width, this.height);
		ctx.fillStyle = "gold";
		ctx.font = "30px Arial";
		ctx.fillText(Math.floor(this.health), this.x + 25, this.y + 30);
	}
}

/* resources */

/* utilities */
function handleGameStatus() {
	ctx.fillStyle = "gold";
	ctx.font = "30px Arial";
	ctx.fillText("Resources: " + numberOfResources, 20, 55);
	if (gameOver) {
		ctx.fillStyle = "black";
		ctx.font = "90px Arial";
		ctx.fillText("GAME OVER", 135, 330);
	}
}

function animate() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = "blue";
	ctx.fillRect(0, 0, controlsBar.width, controlsBar.height);
	handleGameGrid();
	handleDefenders();
	handleEnemies();
	handleGameStatus();
	frame++;
	if (!gameOver) requestAnimationFrame(animate); /* Recusive loop */
}

function collision(first, second) {
	if (!(first.x > second.x + second.width || first.x + first.width < second.x || first.y > second.y + second.height || first.y + first.height < second.y)) {
		return true;
	}
}

createGrid(); /* start grid here */
animate(); // start game
