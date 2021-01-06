const BG_COL = '#231f20';
const SNAKE_COL1 = "#3311ff";
const SNAKE_COL2 = '#11ff33';
const FOOD_COL = "#e66916";

const socket = io('http://teiga.hopto.org:3000');

socket.on("init", handleInit);
socket.on('gameState', handleGameState);
socket.on("gameOver", handleGameOver);
socket.on("gameCode", handleGameCode);
socket.on("unknownGame", handleUnknownGame);
socket.on("tooManyPlayers", handleTooManyPlayers);


const gameScreen = document.getElementById("gameScreen");
const initialScreen = document.getElementById("initialScreen");
const newGameBtn = document.getElementById("newGameButton");
const joinGameBtn = document.getElementById("joinGameButton");
const gameCodeInput = document.getElementById("gameCodeInput");
const gameCodeDisplay = document.getElementById("gameCodeDisplay");
const gamePlayer = document.getElementById("gamePlayer");
const gameScorePlayerOne = document.getElementById("gameScorePlayerOne");
const gameScorePlayerTwo = document.getElementById("gameScorePlayerTwo");

newGameBtn.addEventListener("click", newGame);
joinGameBtn.addEventListener("click", joinGame);

function newGame() {
    socket.emit("newGame");
    init();
}

function joinGame() {
    const code = gameCodeInput.value;
    socket.emit("joinGame", code);
    init();
}

//global variables
let canvas, ctx;
let playerNumber; 
let gameActive = false;
// const gameState = {
//     player: {
//         pos: {
//             x: 3,
//             y: 5,
//         },
//         vel: {
//             x:1,
//             y:0,
//         },
//         snake: [
//             { x:1, y:5},
//             { x:2, y:5},
//             { x:3, y:5}
//         ],  
//     },
//     food: {
//         x:7, y:7
//     },
//     gridsize: 10
// };

function init() {
    initialScreen.classList.add("hidden");
    gameScreen.classList.remove("hidden");

    canvas = document.getElementById("canvas");
    ctx = canvas.getContext('2d');

    canvas.width = canvas.height = 500;

    ctx.fillStyle = BG_COL;
    ctx.fillRect(0,0, canvas.width, canvas.height);
    document.addEventListener('keydown', keydown);

    gameActive = true;
}


function keydown(e) {
    // console.log(e);
    socket.emit("keydown", e.keyCode);
}


function paintGame(state) {
    //paint background
    ctx.fillStyle = BG_COL;
    ctx.fillRect(0,0,canvas.width, canvas.height);

    //paint food
    const food = state.food;
    const gridsize = state.gridsize;
    const size = canvas.width / gridsize;

    ctx.fillStyle = FOOD_COL;
    ctx.fillRect(food.x * size, food.y * size, size, size);

    //call paint Player
    paintPlayer(state.players[0], size, SNAKE_COL1);
    paintPlayer(state.players[1], size, SNAKE_COL2);

}

function paintPlayer(playerState, size, color) {
    const snake = playerState.snake;
    // console.log(snake);
    ctx.fillStyle = color;
    for (let cell of snake) {
        ctx.fillRect(cell.x * size, cell.y * size, size, size);

    }
}

// paintGame(gameState);
function handleGameState(gameState) {
    if (!gameActive) {
        return;
    }
    //parse the message from the server
    // (json string) into an object
    gameState = JSON.parse(gameState);
    requestAnimationFrame( () => {
        paintGame(gameState);
    })
    //update scores
    gameScorePlayerOne.innerText = gameState.players[0].score;
    gameScorePlayerTwo.innerText = gameState.players[1].score;
}

function handleGameOver(data) {
    if (!gameActive) {
        return;
    }
    data = JSON.parse(data);
    if (data.winner === playerNumber) {
        alert("HAI VINTO!!!");
    } else {
        alert("HAI PERSO!!!");
    }
    gameActive = false;
}

function handleGameCode(code) {
    gameCodeDisplay.innerText = code;
}

function handleInit(num) {
    playerNumber = num;
    gamePlayer.innerText = playerNumber.toString();
    gamePlayer.parentElement.style.color = num === 1 ? SNAKE_COL1 : SNAKE_COL2;
    gameScorePlayerOne.style.color = SNAKE_COL1;
    gameScorePlayerTwo.style.color = SNAKE_COL2;
}

function handleUnknownGame () {
    reset();
    alert("Unknwon game code");
}

function handleTooManyPlayers() {
    reset();
    alert("Too many players!");
}

function reset() {
    playerNumber = null;
    gameCodeDisplay.innerText = "";
    gameCodeInput.value="";
    initialScreen.classList.remove("hidden");
    gameScreen.classList.add("hidden");
}