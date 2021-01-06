const {GRID_SIZE} = require('./constants');

function initGame() {
    const state = createGameState();
    randomFood(state);
    return state;
}


function createGameState() {
    return {
        players: [
            {
                pos: {
                    x: 3,
                    y: 5,
                },
                vel: {
                    x:0,
                    y:0,
                },
                score: 0,
                snake: [
                    { x:1, y:5},
                    { x:2, y:5},
                    { x:3, y:5}
                ],  
            }, 
            {
                pos: { 
                    x: 18,
                    y: 6,
                },
                vel: {
                    x:0,
                    y:1,
                },
                score: 0,
                snake: [
                    { x:18, y:4},
                    { x:18, y:5},
                    { x:18, y:6}
                ], 
            }
        ],
        food: {},
        gridsize: GRID_SIZE,
        active: true,
        level: 0,
    }
};

function gameLoop(state) {
    //the logic of the game
    if (!state) {
        return;
    }
    const playerOne = state.players[0];
    const playerTwo = state.players[1];

    //the position is the head of the snake
    playerOne.pos.x += playerOne.vel.x;
    playerOne.pos.y += playerOne.vel.y;
    playerTwo.pos.x += playerTwo.vel.x;
    playerTwo.pos.y += playerTwo.vel.y;

    //reach the boundaries? LOOOOSER!
    if (playerOne.pos.x < 0 || playerOne.pos.x > GRID_SIZE || playerOne.pos.y<0 || playerOne.pos.y > GRID_SIZE) {
        return 2; //player one loose, player two wins!
    }
    if (playerTwo.pos.x < 0 || playerTwo.pos.x > GRID_SIZE || playerTwo.pos.y<0 || playerTwo.pos.y > GRID_SIZE) {
        return 1; // the opposite!
    }
    // hit the food
    if (state.food.x === playerOne.pos.x && state.food.y === playerOne.pos.y) {
        //add this position to the snake!
        playerOne.snake.push({...playerOne.pos});
        // console.log(playerOne.snake)
        //and increment again the position... 
        playerOne.pos.x += playerOne.vel.x;
        playerOne.pos.y += playerOne.vel.y;
        //updates the score:
        playerOne.score++;
        //new food (random)
        randomFood(state);
    }
    // hit the food
    if (state.food.x === playerTwo.pos.x && state.food.y === playerTwo.pos.y) {
        //add this position to the snake!
        playerTwo.snake.push({...playerTwo.pos});
        // console.log(playerOne.snake)
        //and increment again the position... 
        playerTwo.pos.x += playerTwo.vel.x;
        playerTwo.pos.y += playerTwo.vel.y;
        //updates the score:
        playerTwo.score++;
        //new food (random)
        randomFood(state);
    }

    //hit the snake (i.e. the head is overlapping the rest of the snake)
    //first check if the snake is moving...
    if (playerOne.vel.x || playerOne.vel.y) {
        for (let cell of playerOne.snake) {
            //nooooo!
            if (cell.x === playerOne.pos.x && cell.y === playerOne.pos.y) {
                return 2;
            }
        }
        //update the snake!
        //add new head and remove the tail
        playerOne.snake.push({...playerOne.pos});
        playerOne.snake.shift();
    }
    //hit the snake (i.e. the head is overlapping the rest of the snake)
    //first check if the snake is moving...
    if (playerTwo.vel.x || playerTwo.vel.y) {
        for (let cell of playerTwo.snake) {
            //nooooo!
            if (cell.x === playerTwo.pos.x && cell.y === playerTwo.pos.y) {
                return 1; //player One is the winner!
            }
        }
        //update the snake!
        //add new head and remove the tail
        playerTwo.snake.push({...playerTwo.pos});
        playerTwo.snake.shift();
    }
    //if everything is ok, the game is still on (no winner)
    return false;
}


function randomFood(state) {
    food = {
        // new food BETWEEN 1 and GRID_SIZE-1 
        x: Math.floor(Math.random() * (GRID_SIZE-2) + 1),
        y: Math.floor(Math.random() * (GRID_SIZE-2) + 1) 
    }
    //be sure that the food is not ON the snake1!
    for (let cell of state.players[0].snake) {
        if (cell.x === food.x && cell.y === food.y) {
            // recursive call!
            return randomFood(state);
        }
    }
    //be sure that the food is not ON the snake2!
    for (let cell of state.players[1].snake) {
        if (cell.x === food.x && cell.y === food.y) {
            // recursive call!
            return randomFood(state);
        }
    }
    state.food = food;
    // level-up
    if ((state.players[0].score % 5 === 0 && state.players[0].score>0)  || 
        (state.players[1].score % 5 === 0 && state.players[1].score>0)) {
            state.level++;
            console.log("level up!", state.level);

    }

}



function getUpdatedVelocity(keyCode) {
    switch (keyCode) {
        case 37: {
            //left
            return {x: -1, y: 0 };
        }
        case 38: {
            //down
            return {x: 0, y: -1 };
        }
        case 39: {
            //right
            return {x: 1, y: 0 };
        }
        case 40: {
            //up
            return {x: 0, y: 1 };
        }
    }
}

module.exports = {
    initGame, 
    gameLoop,
    getUpdatedVelocity
}

