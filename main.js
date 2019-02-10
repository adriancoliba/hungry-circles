const gameOver = document.getElementById("GameStatus");
const playArea = document.getElementById("playArea");
const scoreBoard = document.getElementById("score");
const startMenu = document.getElementById("startGame");
const startBtn = document.querySelector("#startGame button");
const windowX = 1200;
const windowY = 600;
let redMax = 10;
let redMin = 2;
let score = 0;
let time = 0;
let baddyArray = [];
let index = 0;
let baddies = 0;
scoreBoard.firstElementChild.textContent += score;
scoreBoard.lastElementChild.textContent += time.toFixed(2);

//constrains all movement to within the play area.
function constrain(obj) {
    if (obj.x < 0) {
        obj.x = 0;
        //the five comes from the border width
    } else if (obj.x > windowX - obj.diameter - 5) {
        obj.x = windowX - obj.diameter - 5;
    }
    if (obj.y < 0) {
        obj.y = 0;
    } else if (obj.y > windowY - obj.diameter - 5) {
        obj.y = windowY - obj.diameter - 5;
    }
}

//get the distance between (a,b) and (x,y)
function distance(a, b, x, y) {
    return Math.sqrt(Math.pow(a - x, 2) + Math.pow(b - y, 2));
}

//The player object
const player = {
    circle: document.getElementById("blueCircle"),
    health: true,
    diameter: 50,
    x: 0,
    y: 0,
    movXright: 0,
    movXleft: 0,
    movYup: 0,
    movYdown: 0,
    color: "#0000ff",
    render: function() {
        g_canvas_context.clearRect(0, 0, 1200, 600);
        g_canvas_context.beginPath();
        g_canvas_context.arc(
            player.x + player.diameter / 2,
            player.y + player.diameter / 2,
            player.diameter / 2,
            0,
            2 * Math.PI
        );
        g_canvas_context.fillStyle = player.color;
        g_canvas_context.fill();
        g_canvas_context.lineWidth = 5;
        g_canvas_context.stroke();
        g_canvas_context.closePath();
    }
};

//reset the game so we can try again
function reset() {
    baddies = 0;
    score = 0;
    time = 0;
    scoreBoard.firstElementChild.textContent = "Score: " + score;
    scoreBoard.lastElementChild.textContent = "Time: " + time.toFixed(2);
    
    index = 0;
    baddyArray = [];
    redMax = 4;
    redMin = 1;
    player.health = true;
    player.x = 0;
    player.y = 0;
    player.movXright = 0;
    player.movXleft = 0;
    player.movYup = 0;
    player.movYdown = 0;
    player.diameter = 50;
}

//constructor function for the red circle objects.
function Enemy(diameter, x, y) {
    this.diameter = diameter;
    this.x = x;
    this.y = y;
    this.color = "#ff0000";
    this.health = true;
    this.speed = 1;

    //calculate collision detection by comparing the distances from center points
    this.render = () => {
        if ((this.health) && (player.health)) {
            g_canvas_context.beginPath();
            g_canvas_context.arc(
                this.x + this.diameter / 2,
                this.y + this.diameter / 2,
                this.diameter / 2,
                0,
                2 * Math.PI
            );
            g_canvas_context.fillStyle = this.color;
            g_canvas_context.fill();
            g_canvas_context.lineWidth = 5;
            g_canvas_context.stroke();
            g_canvas_context.closePath();
        }
    };//end collision detection

    //calculate collision detection by comparing the distances from center points
    this.collisionDetection = () => {
        if ((this.health) && (player.health)) {
            //find the center of "this" circle and the player, and find the distance between those centers.
            this.distance = distance(this.x + this.diameter / 2, this.y + this.diameter / 2,
                    player.x + player.diameter / 2, player.y + player.diameter / 2);
            if (this.distance < this.diameter / 2 + player.diameter / 2) {
                if (this.diameter <= player.diameter) {
                    score += 1; //make sure it only triggers once
                    scoreBoard.firstElementChild.textContent = "Score: " + score;
                    player.diameter += 10;
                    redMax += 1;
                    redMin += 1;
                    baddies -= 1; //allow for a new baddie.
                    this.health = false;
                } else {
                    player.health = false;
                }
            }
        }
    };//end collision detection

    //chase or run away from the player, depending on size
    this.updatePos = () => {
        this.distance = distance(this.x, this.y, player.x, player.y);
        if (this.health) {
            //they move more slowly than the player

            if (this.diameter > player.diameter) {
                //give chase
                if (this.distance != 0) {
                    this.x += this.x > player.x ? -this.speed : this.speed;
                    constrain(this);
                }
                if (this.distance != 0) {
                    this.y += this.y > player.y ? -this.speed : this.speed;
                    constrain(this);
                }
            } else {
                //run away
                if (this.distance < 300) {
                    this.x += this.x > player.x ? this.speed : -this.speed;
                    constrain(this);
                } else {
                    this.x += 0;
                }
                if (this.distance < 300) {
                    this.y += this.y > player.y ? this.speed : -this.speed;
                    constrain(this);
                } else {
                    this.y += 0;
                }
            }
        }
    };//end updatePos();
}

//keyboard events
document.addEventListener("keydown", (event) => {
    var move_speed = 2;
    switch (event.key) {
        case 'd':
            player.movXright = move_speed;
            break;
        case 'a':
            player.movXleft = move_speed;
            break;
        case 'w':
            player.movYup = move_speed;
            break;
        case 's':
            player.movYdown = move_speed;
            break;
    }
});

document.addEventListener("keyup", (event) => {
    switch (event.key) {
        case 'd':
            player.movXright = 0;
            break;
        case 'a':
            player.movXleft = 0;
            break;
        case 'w':
            player.movYup = 0;
            break;
        case 's':
            player.movYdown = 0;
            break;
    }
});

//start the game
function startGame() {

    //Set global references to canvas and canvas context
    if (!window.g_game_board)
        window.g_game_board = document.getElementById("game_board");
    if (!window.g_canvas_context)
        window.g_canvas_context = g_game_board.getContext("2d");

    //watch time
    const timeInterval = setInterval(() => {
        time += 0.1;
        scoreBoard.lastElementChild.textContent = "Time: " + time.toFixed(2);
    }, 100);

    //generate red circles every 5 to 10 seconds
    const baddieInterval = setInterval(() => {
        if (baddies < 20) {
            let diam = Math.floor(10 * (Math.random() * (redMax - redMin) + redMin));
            let pos_x = Math.floor(10 * (Math.random() * ((windowX / 10) - 10) + 10));
            if (pos_x + diam > windowX) {
                pos_x -= diam;
            }
            let pos_y = Math.floor(10 * (Math.random() * ((windowY / 10) - 10) + 10));
            if (pos_y + diam > windowY) {
                pos_y -= diam;
            }
            baddyArray[index] = new Enemy(diam, pos_x, pos_y);
            baddies += 1;
            index += 1;
        }
    }, (1000 * Math.floor((Math.random() * (10 - 5) + 5))));

    //update the screen every 33 milliseconds (approx 30 FPS)
    const gameInterval = setInterval(() => {
        if (player.health) {
            g_canvas_context.clearRect(0, 0, 1200, 600);//Clear previous frame to begin drawing the next frame
            
            player.x += -player.movXleft + player.movXright;
            player.y += -player.movYup + player.movYdown;
            constrain(player);

            player.render();

            //remove all dead red circles from the baddyArray
            baddyArray = baddyArray.filter((redCircle) => {
                return redCircle.health != false;
            });
            //run the collision detection and update position methods.
            for (let i of baddyArray) {
                i.collisionDetection();
                i.updatePos();
                i.render();
            }
        } else {
            clearInterval(gameInterval);
            clearInterval(baddieInterval);
            clearInterval(timeInterval);
            gameOver.style.display = "block";
            gameOver.style.left = (windowX / 2 - 150) + "px";
            let message = document.createElement("div");
            message.innerHTML = `<p>Game Over!</p>
                           <p>You earned ${score} points!</p>
                           <p>You survived ${time.toFixed(2)} seconds!</p>
                           <button>Play Again?</button>`;
            gameOver.appendChild(message);
            const playAgain = document.querySelector("#GameStatus button");
            playAgain.className = "button";
            playAgain.addEventListener("click", () => {
                gameOver.removeChild(message);
                gameOver.style.display = "none";
                reset();
                startMenu.style.display = "block";
            });
        }
    }, 60 / 1000);
}

//start game when button is clicked.
startBtn.addEventListener("click", () => {
    startGame();
    startMenu.style.display = "none";
});
