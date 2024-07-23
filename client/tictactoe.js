const express = require("express"); //import express
const app = express(); //use the app express
const path = require("path"); //importing path for express
const http = require("http"); //importing http for creating socket.io server
const socketIo = require("socket.io");//importing socket
const server = http.createServer(app);//creating the server usinh http
const io = socketIo(server);//using socket in the server

// serve static files from the root
app.use(express.static(path.resolve("")));

let arr = []; // Array to store player names searching for a game
let playing = []; // Array to store ongoing games

// Handle new socket connections
io.on("connection", (socket) => {
    // Handle the 'search' event
    socket.on("search", (e) => {
        if (e.name != null) {       
            arr.push(e.name); // Add player name to the array

            // if 2 players join start game
            if (arr.length >= 2) {
                // Create player objects
                let pobj1 = {
                    p1name: arr[0],
                    p1value: "X",
                    p1move: "",
                };
                let pobj2 = {
                    p2name: arr[1],
                    p2value: "O",
                    p2move: "",
                };

                // Create a game object
                let obj = {
                    p1: pobj1,
                    p2: pobj2,
                    sum: 1
                };

                playing.push(obj); // Add the game to the playing array
                arr.splice(0, 2); // Remove the players from the search array
                io.emit("find", { allplayers: playing }); // Notify all clients about the new game
            }
        }
    });

    // Handle the 'playing' event
    socket.on("playing", (e) => {
        if (e.value == "X") {
            let objchange = playing.find(obj => obj.p1.p1name);
            objchange.p1.p1move = e.id; // Update player 1 move
            objchange.sum++;
        } else if (e.value == "O") {
            let objchange = playing.find(obj => obj.p2.p2name);
            objchange.p2.p2move = e.id; // Update player 2 move
            objchange.sum++;
        }
        io.emit("playing", { allplayers: playing }); // Notify all clients about the game
    });

    // Handle the 'makeMove' event for AI mode
    socket.on('makeMove', (board) => {
        const move = getmove(board); // Get the best move from the AI
        io.emit('moveMade', move); // Notify the client about the AI move
    });
});

// Serve the index.html file for the root route
app.get("/", (req, res) => {
    return res.sendFile(path.join(__dirname, "index.html"));
});

// Start the server
server.listen(3000, () => {
    console.log(`http://localhost:3000`);
});

// function to check if there are any moves left on the board
function moveleft(board) { 
    for(let i = 0; i < 9; i++)
        if (board[i] == '_') 
            return true; 
    return false; 
} 

// Evaluate the board to check for a winner
function evaluate(board) { 
    const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6]  // Diagonals
    ];
    //all winning combinations
    for (const [a, b, c] of winningCombinations) {
        if (board[a] === board[b] && board[b] === board[c]) {
            if (board[a] === "X") return -10;// if X wins -10
            if (board[a] === "O") return +10;//if O winns +10
        }
    }
    return 0;//if game is going on return 0
} 

// Minimax algorithm to find the best move for the AI
function minimax(board, depth, ismax) {   
    let score = evaluate(board); //checking if any winner
    if (score == 10) //winner is O
        return score; 
    if (score == -10) //winner is X
        return score; 
    if (moveleft(board) == false) //if none wins and still 0 is returned function movesleft called
        return 0; //
    if (ismax) { //if it is the turn of maximizer i.e O
        let best = -1000; 
        for(let i = 0; i < 9; i++) { //loop runs everytime for finding best move in each case
            if (board[i] == '_') { 
                board[i] = 'X'; //setting the next move for checking
                best = Math.max(best, minimax(board, depth + 1, !ismax)); //recurrsively calling the minimax function
                board[i] = '_'; //removing the move set for checking
            }       
        } 
        return best; //value of best move is returned
    } else { //move of next person i.e X returning minimum possible result
        let best = 1000; 
        for(let i = 0; i < 9; i++) { 
            if (board[i] == '_') { 
                board[i] = 'O';  //setting the next move for checking
                best = Math.min(best, minimax(board, depth + 1, !ismax)); 
                board[i] = '_'; //removing the move set for checking
            } 
        } 
        return best; 
    } 
} 

// get the best move for the AI
function getmove(board) { 
    let bestvalue = -1000;
    let move = -1;  // start to -1 for no move is made

    for(let i = 0; i < 9; i++) {
        if (board[i] == '_') {
            board[i] = "O";  //setting the next move for checking
            let value = minimax(board, 0, true); //calling the minimax
            board[i] = '_'; //removing the move set for checking
            if (value > bestvalue) { //if returned value is better than the last
                move = i; //set the index as best move
                bestvalue = value; //the given value is set as bestvalue
            } 
        } 
    }
    return move;//index of best move is returned
}
