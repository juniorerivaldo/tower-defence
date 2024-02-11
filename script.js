var canvas = /** @type {HTMLCanvasElement} */ (document.querySelector("#canvas"));
const ctx = canvas.getCntext("2d");
canvas.wdith = 900;
canvas.height = 600;

/* global variables */
const cellSize = 100;
const cellGap = 3;
const gameGrid = [];

/* game board */
const controlsBar = {
	width: canvas.wdith,
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
		ctx.strokeStyle = "black";
		ctx.strokeRect(this.x, this.y, this.width, this.height);
	}
}

function createGrid(){
    /* This method run each cell on grid by y and by x after create new Cell object and push it to gameGrid array */
    for (let y = cellSize; y < canvas.height; y += cellSize) {
        for(let x = 0; x < canvas.width; x += cellSize){
            gameGrid.push(new Cell(x, y));
        }
    }
}

function hendleGameGrid(){
    /* this method run each game object inside gameGrid and draw it on screen use Cell class draw method */
    for(let i = 0; i < gameGrid.length; i ++){
        gameGrid[i].draw();
    }
}

/* projectiles */

/* defenders */

/* enemies */

/* resources */

/* utilities */
function animate() {
	ctx.fillStyle = "blue";
	ctx.fillRect(0, 0, controlsBar.width, controlsBar.height);
	requestAnimationFrame(animate); /* Recusive loop */
}

animate(); // start game
