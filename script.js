var canvas = /** @type {HTMLCanvasElement} */ (document.querySelector("#canvas"));
const ctx = canvas.getContext("2d");
canvas.width = 900;
canvas.height = 600;

/* global variables */
const cellSize = 100;
const cellGap = 3;
const gameGrid = [];
const defenders = [];
let numberOfResources = 300; /* initial number to spawn defenders */ 

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
    for(let i = 0; i < defenders.length; i ++){
        if(defenders[i].x === gridPositionX && defenders[i].y === gridPositionY){
            return; /*  not spawn defender on top of other defender */
        }
    }
    if(numberOfResources >= defenderCost){
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

function handleDefenders(){
    for(let i = 0; i <defenders.length; i ++){
        defenders[i].draw();
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
		ctx.fillRect(this.x, this.y, this.width, this.health);
		ctx.fillStyle = "gold";
		ctx.font = "30px Arial";
		ctx.fillText(Math.floor(this.health), this.x + 25, this.y + 30);
	}
}

/* enemies */

/* resources */

/* utilities */
function handleGameStatus(){
    ctx.fillStyle = 'gold';
    ctx.font = '30px Arial'
    ctx.fillText('Resources: ' + numberOfResources, 20, 55 );
}


function animate() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	ctx.fillStyle = "blue";
	ctx.fillRect(0, 0, controlsBar.width, controlsBar.height);
	handleGameGrid();
    handleDefenders();
    handleGameStatus();
	requestAnimationFrame(animate); /* Recusive loop */
}

function collision(first, second) {
	if (!(first.x > second.x + second.width || first.x + first.width < second.x || first.y > second.y + second.height || first.y + first.height < second.y)) {
		return true;
	}
}

createGrid(); /* start grid here */
animate(); // start game
