const io = require('socket.io')({
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const { initGame, gameLoop, getUpdatedVelocity } = require("./game");
const { FRAME_RATE } = require("./constants");
const { KeyObject } = require('crypto');
const { makeId } = require('./utils');
const { SSL_OP_SSLEAY_080_CLIENT_DH_BUG } = require('constants');

const state = {};
const clientRooms = {};
var frame;

io.on('connection', client => {
    console.log("CONNECTED: ", client.id);
    client.on("disconnect", ()=> {
        console.log("DISCONNECTED!!!!", client.id);
    })
    client.on("keydown", handleKeyDown);
    //add here the function because we need to access to the client var
    // if we move this outside, we have to provide it...
    function handleKeyDown(keyCode) {
        const gameCode = clientRooms[client.id];
        if (!gameCode){
            return;
        }
        try {
           keyCode = parseInt(keyCode);
        } catch(e) {
            console.log(e);
            return;
        }

        const vel = getUpdatedVelocity(keyCode);
        if (vel) {
            state[gameCode].players[client.number-1].vel = vel;
        }
    }
    client.on("newGame", handleNewGame);
    function handleNewGame() {
        let gameCode = makeId(5);
        state[gameCode]=initGame();
        // console.log(state);
        clientRooms[client.id]=gameCode;
        client.emit("gameCode", gameCode);

        client.join(gameCode);
        client.number = 1; //Player One
        client.emit("init", 1); 
    }

    client.on("joinGame", handleJoinGame);
    function handleJoinGame(gameCode) {
        // console.log(gameCode);
        //find the room
        const room = io.sockets.adapter.rooms.get(gameCode);
        let numClients=0;
        // console.log(room);
        if (room) {
            //retrive the users in this room
            numClients = room.size;
        }
        if (numClients ===0) {
            //nobody here, no valid game!
            client.emit("unknownGame");
            return;
        } else if (numClients > 1 ) {
            //too many players...
            client.emit("tooManyPlayers");
            return;
        } else {
            // ok, you can join to the game!
            clientRooms[client.id] = gameCode;
            client.join(gameCode);
            //player 2 -- same as player 1!
            client.number = 2;
            client.emit("init", 2);
            startGame(gameCode);
        }

    }

})

function startGame(gameCode) {
    var frame = FRAME_RATE+state[gameCode].level;

    function startGameInterval() {
        frame = FRAME_RATE+state[gameCode].level;
        clearInterval(intervalId);
        const winner = gameLoop(state[gameCode]);
        //no winner = 0, winner = 1,2,...
        if (!winner) {
            emitGameState(gameCode, state[gameCode]);
            intervalId = setInterval(startGameInterval, 1000/frame);
        } else {
            emitGameOver(gameCode, winner);
            // if gameover -> reset the state of this room
            state[gameCode] = null;
            return;
        }
    }
    var intervalId = setInterval(startGameInterval, 1000/frame);
}


function emitGameState(gameCode, state) {
    io.sockets.in(gameCode).emit('gameState', JSON.stringify(state));
}

function emitGameOver(gameCode, winner) {
    io.sockets.in(gameCode).emit('gameOver', JSON.stringify({winner}));
}


io.listen(3000);