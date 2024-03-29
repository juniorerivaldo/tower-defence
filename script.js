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
const projectiles = [];
const resources = [];
const floatMessages = [];
const amounts = [30, 20, 40];
const enemyTypes = [];
const enemy1 = new Image();
const defender1 = new Image();
let gameOver = false;
let winning = false;
let numberOfResources = 300; /* initial number to spawn defenders */
let enemiesInterval = 600;
let winningScore = 180;
let frame = 0;
let score = 0;

// mouse
const mouse = {
	x: 10,
	y: 10,
	width: 0.1,
	height: 0.1,
};

/* game board */
const controlsBar = {
	width: canvas.width,
	height: cellSize,
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

/* utilities */
function handleGameStatus() {
	ctx.fillStyle = "gold";
	ctx.font = "30px Arial";
	ctx.fillText("Score: " + score, 20, 40);
	ctx.fillText("Resources: " + numberOfResources, 20, 80);
	if (gameOver) {
		ctx.fillStyle = "red";
		ctx.font = "90px Arial";
		ctx.fillText("GAME OVER", 135, 330);
	}
	if (score >= winningScore && enemies.length === 0) {
		ctx.fillStyle = "black";
		ctx.font = "90 Arial";
		ctx.fillText("WINNING WITH SCORE : " + score, 135, 330);
	}
}

function animate() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = "blue";
	ctx.fillRect(0, 0, controlsBar.width, controlsBar.height);
	handleGameGrid();
	handleDefenders();
	handleResources();
	handleProjectiles();
	handleEnemies();
	handleGameStatus();
	handleFloatingMessages();
	frame++; /* frame rate */
	if (!gameOver) requestAnimationFrame(animate); /* Recusive loop */
}

function collision(first, second) {
	if (!(first.x > second.x + second.width || first.x + first.width < second.x || first.y > second.y + second.height || first.y + first.height < second.y)) {
		return true;
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

function handleFloatingMessages() {
	for (let i = 0; i < floatMessages.length; i++) {
		floatMessages[i].update();
		floatMessages[i].draw();
		if (floatMessages[i].lifeSpan >= 50) {
			floatMessages.splice(i, 1);
			i--;
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
		defenders[i].update();
		defenders[i].draw();
		if (enemiesPositions.indexOf(defenders[i].y) !== -1) {
			/* verify if any enemy on enemiesPositions has same y of defender */
			defenders[i].shooting = true;
		} else {
			defenders[i].shooting = false;
		}
		for (let j = 0; j < enemies.length; j++) {
			if (defenders[i] && collision(defenders[i], enemies[j])) {
				if (defenders[i].y === enemies[j].y) {
					enemies[j].movement = 0;
					defenders[i].health -= 0.2;
				}
			}
			if (defenders[i] && defenders[i].health <= 0) {
				defenders.splice(i, 1);
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
		if (enemies[i].x <= 0) {
			gameOver = true; /* case any enemy cross the border game is over */
		}
		if (enemies[i].health <= 0) {
			let gainedResources = enemies[i].maxHealth / 10;
			numberOfResources += gainedResources;
			score += gainedResources;
			const findIndex = enemiesPositions.indexOf(enemies[i].y); /* look for this enemy y position to remove from enemies Positions array */
			enemiesPositions.splice(findIndex, 1);
			floatMessages.push(new floatingMessage(gainedResources + "+", enemies[i].x, enemies[i].y, 30, "black"));
			floatMessages.push(new floatingMessage(gainedResources + "+", enemies[i].x, enemies[i].y, 240, 85, 20, "white"));
			enemies.splice(i, 1);
			i--;
		}
	}
	if (frame % enemiesInterval === 0 && score < winningScore) {
		let verticalPosition = Math.floor(Math.random() * 5 + 1) * cellSize;
		enemies.push(new Enemy(verticalPosition));
		enemiesPositions.push(verticalPosition);
		if (enemiesInterval > 120) enemiesInterval -= 40;
	}
}

function handleProjectiles() {
	for (let i = 0; i < projectiles.length; i++) {
		projectiles[i].update();
		projectiles[i].draw();
		for (let j = 0; j < enemies.length; j++) {
			if (projectiles[i] && enemies[j] && collision(projectiles[i], enemies[j])) {
				enemies[j].health -= projectiles[i].power;
				projectiles.splice(i, 1);
				i--;
			}
		}
		if (projectiles[i] && projectiles[i].x > canvas.width - cellSize) {
			projectiles.splice(i, 1);
			i--;
		}
	}
}

function handleResources() {
	if (frame % 500 === 0 && score < winningScore) {
		resources.push(new Resource());
	}
	for (let i = 0; i < resources.length; i++) {
		resources[i].draw();
		if (resources[i] && mouse.x && mouse.y && collision(resources[i], mouse)) {
			numberOfResources += resources[i].amount;
			floatMessages.push(new floatingMessage(resources[i].amount + "+", resources[i].x, resources[i].y, 20, "black"));
			floatMessages.push(new floatingMessage(resources[i].amount + "+", 240, 85, 20, "white"));
			resources.splice(i, 1);
			i++;
		}
	}
}

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

/* projectiles */
class Projectile {
	constructor(x, y) {
		this.x = x;
		this.y = y;
		this.width = 10;
		this.height = 10;
		this.power = 20;
		this.speed = 5;
	}
	update() {
		this.x += this.speed;
	}
	draw() {
		ctx.fillStyle = "black";
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.width, 0, Math.PI * 2);
		ctx.fill();
	}
}

/* defenders */
defender1.src = 'plant.png';
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
		this.frameX = 0;
		this.frameY = 0; /* this is aways be 0 becouse only one row is in the spritesheet */
		this.minFrame = 0;
		this.maxFrame = 1; /* this is total number of frames in image start by 0 */
		this.spriteWidth = 167; /* this is srite width / by number of frames in sprite */
		this.sriteHeight = 243;
	}
	update() {
		if (this.shooting) {
			this.timer++;
			if (this.timer % 100 === 0) {
				projectiles.push(new Projectile(this.x + 70, this.y + 50));
			}
		} else {
			this.timer = 0;
		}
		if (frame % 10 === 0) {
			if (this.frameX < this.maxFrame) this.frameX++;
			else this.frameX = this.minFrame;
		}
	}
	draw() {
		// ctx.fillStyle = "blue";
		// ctx.fillRect(this.x, this.y, this.width, this.height);
		ctx.fillStyle = "gold";
		ctx.font = "30px Arial";
		ctx.fillText(Math.floor(this.health), this.x + 25, this.y + 30);
		ctx.drawImage(defender1, this.frameX * this.spriteWidth, 0, this.spriteWidth, this.sriteHeight, this.x, this.y, this.width, this.height);
	}
}

/* enemies */
enemy1.src = "zombie.png";
enemyTypes.push(enemy1);
class Enemy {
	constructor(verticalPosition) {
		this.x = canvas.width;
		this.y = verticalPosition;
		this.width = cellSize;
		this.height = cellSize;
		this.speed = Math.random() * 0.2 + 0.4;
		this.movement = this.speed;
		this.health = 100;
		this.maxHealth = this.health;
		this.verticalPosition = verticalPosition; /* validar depois se da para usar isso dentro da classe ao inves de criar um novo array só para dar push no position de cada enemi */
		this.enemyType = enemyTypes[0];
		this.frameX = 0;
		this.frameY = 0; /* this is aways be 0 becouse only one row is in the spritesheet */
		this.minFrame = 0;
		this.maxFrame = 7; /* this is total number of frames in image start by 0 */
		this.spriteWidth = 292; /* this is srite width / by number of frames in sprite */
		this.sriteHeight = 410;
	}
	update() {
		this.x -= this.movement;
		if (frame % 10 === 0) {
			if (this.frameX < this.maxFrame) this.frameX++;
			else this.frameX = this.minFrame;
		}
	}
	draw() {
		// ctx.fillStyle = "red";
		// ctx.fillRect(this.x, this.y, this.width, this.height);
		ctx.drawImage(this.enemyType, this.frameX * this.spriteWidth, 0, this.spriteWidth, this.sriteHeight, this.x, this.y, this.width, this.height);
		ctx.fillStyle = "gold";
		ctx.font = "20px Arial";
		ctx.fillText(Math.floor(this.health), this.x + 45, this.y - 10);
	}
}

/* resources */
class Resource {
	constructor() {
		this.x = Math.random() * (canvas.width - cellSize);
		this.y = Math.floor(Math.random() * 5) + 1 * cellSize + 25;
		this.width = cellSize * 0.6;
		this.height = cellSize * 0.6;
		this.amount = amounts[Math.floor(Math.random() * amounts.length)];
	}
	draw() {
		ctx.fillStyle = "yellow";
		ctx.fillRect(this.x, this.y, this.width, this.height);
		ctx.fillStyle = "black";
		ctx.font = "20px Arial";
		ctx.fillText(this.amount, this.x + 15, this.y + 25);
	}
}

/* floating messages */
class floatingMessage {
	constructor(value, x, y, size, color) {
		this.value = value;
		this.x = x;
		this.y = y;
		this.size = size;
		this.lifeSpan = 0;
		this.color = color;
		this.opacity = 1;
	}
	update() {
		this.y -= 0.3;
		this.lifeSpan += 1;
		if (this.opacity > 0.01) this.opacity -= 0.01;
	}
	draw() {
		ctx.globalAlpha = this.opacity;
		ctx.fillStyle = this.color;
		ctx.font = this.size + "Arial";
		ctx.fillText(this.value, this.x, this.y);
		ctx.globalAlpha = 1; /* after draw text reset this global prop to default; this is for opacity of text */
	}
}

canvas.addEventListener("click", function () {
	/* this needs to be here for use class floating messages, because i cant use class before create it. original path of this is on top of file for best praticles. */ let defenderCost = 100;
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
	} else {
		floatMessages.push(new floatingMessage("Need More Resources !!", gridPositionX, gridPositionY, 20, "blue"));
	}
});

createGrid(); /* start grid here */
animate(); // start game

window.addEventListener("resize", function () {
	canvasPosition = canvas.getBoundingClientRect(); /* this function recalculate canvas bound if screen is resize, for mouse coords */
});
