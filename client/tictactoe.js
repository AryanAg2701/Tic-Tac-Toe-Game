const express = require("express");
const app = express();
const path = require("path");
const http = require("http");
const socketIo = require("socket.io");
const server = http.createServer(app);
const io = socketIo(server);
app.use(express.static(path.resolve("")));

let arr = [];
let playing = [];

io.on("connection", (socket) => {
    socket.on("search", (e) => {
        if (e.name != null) {       
            arr.push(e.name);

            if (arr.length >= 2) {
                let pobj1 = {
                    p1name: arr[0],
                    p1value: "X",
                    p1move:"",
                    p1id: "",
                };
                let pobj2 = {
                    p2name: arr[1],
                    p2value: "O",
                    p2move:"",
                    p2id: "",
                };

                let obj = {
                    p1: pobj1,
                    p2: pobj2,
                    sum:1
                };
                playing.push(obj);
                arr.splice(0, 2);
                io.emit("find", { allplayers: playing });
            }
        }
    });
    socket.on("playing",(e)=>{
        if(e.value=="X"){
            let objchange=playing.find(obj=>obj.p1.p1name)
            objchange.p1.p1move=e.id
            objchange.sum++;
        }
        else if(e.value=="O"){
            let objchange=playing.find(obj=>obj.p2.p2name)
            objchange.p2.p2move=e.id
            objchange.sum++;
        }
        io.emit("playing",{allplayers:playing})
    })

    socket.on('makeMove', (board) => {
        const bestMove = getBestMove(board);
        io.emit('moveMade', bestMove);  // Update this line
    });
});

app.get("/", (req, res) => {
    return res.sendFile(path.join(__dirname, "index.html"));
});

server.listen(3000, () => {
    console.log(`http://localhost:3000`);
});

function isMovesLeft(board) 
{ 
    for(let i = 0; i < 9; i++)
        if (board[i] == '_') 
            return true; 
    return false; 
} 

function evaluate(board) { 
    const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6]  // Diagonals
    ];

    for (const [a, b, c] of winningCombinations) {
        if (board[a] === board[b] && board[b] === board[c]) {
            if (board[a] === "X") return -10;
            if (board[a] === "O") return +10;
        }
    }
    return 0;
} 

function minimax(board, depth, isMax) 
{   
    let score = evaluate(board); 
    if (score == 10) 
        return score; 
    if (score == -10) 
        return score; 
    if (isMovesLeft(board) == false) 
        return 0; 
    if (isMax) 
    { 
        let best = -1000; 
        for(let i = 0; i < 9; i++) 
        { 
            if (board[i]=='_') { 
                board[i] = 'X'; 
                best = Math.max(best, minimax(board,depth + 1, !isMax)); 
                board[i]= '_'; 
            }       
        } 
        return best; 
    }
    else
    { 
        let best = 1000; 
        for(let i = 0; i < 9; i++) 
        { 
            if (board[i] == '_') 
            { 
                board[i] = 'O'; 
                best = Math.min(best, minimax(board, depth + 1, !isMax)); 
                board[i] = '_'; 
            } 
        } 
        return best; 
    } 
} 

function getBestMove(board) 
{ 
    let bestVal = -1000;
    let bestMove = -1;  // Initialize to -1 to signify no move found yet

    for(let i = 0; i < 9; i++) 
    {
        if (board[i] == '_') 
        {
            board[i] = "O"; 
            let moveVal = minimax(board, 0, true); 
            board[i] = '_'; 
            if (moveVal > bestVal) 
            { 
                bestMove = i; 
                bestVal = moveVal; 
            } 
        } 
    }
    return bestMove;
}
