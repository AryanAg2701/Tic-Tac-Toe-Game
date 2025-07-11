
# socket.io
Working requires node_ modules. to run the program first use "cd client" then "npm run devStart" in the Terminal.

It is a TIC TAC TOE game made using socket.io module server.
Game has 2 modes :
1. 2 player
2. AI mode

in 2 player mode write your name and click search for player now  in  other terminal open the same port and type the second player name and click search when 2 players have clicked searched the html page uses socket.emit with "search" which is recieved by the server (tictactoe.js).
they both get paired up as the player name gets filled into a allplayers arrray and 3 objects are made for player 1 ,player 2 and game obj. then socket again emits to html script "find".

When they get paired the tic tac toe grid shows up made up of buttons and other things get hidden. The games starts with X turn and onclick the button gets disabled and gets the inner text X then diplay changes to O turn and when he clicks the same happens.After each move socket is emitted "playing" to server and the winning condition is checked after each move and the sum variable takes care of it for positive sum O wins else X , or if the sum is greater than 9 it is a draw.
With each move the sum variable is incremented by 1 on the server.
An alert shows put declaring the winner and page reloads itself after the socket emits "Game Over" to the server where it refreshes the arrays and objects.

in AI mode you need to enter your name and click ai mode the game starts with the bot which uses minimax algorithm to play.THe game checking logic is same for the winner in this case html script emits to server "move Made" after the user clicks on any button the server finds the best move for O and emits "make move" to script similarly game winner is checked after each emit and if anyone is satisfying the winning conditions the same steps occur as for 2 player game.

The server uses minimax algorithm to find the best move it asigns X as maximizer and O as minimizer if X is winning _10 is returned and for O -10 is returned in case of draw 0 is returned. minimax calls it self recurisively inside the getbestmove function which makes a array of 9 elements each filled with "_" initially and gets changed on each click by user and computer move.
The function checks if any element in array is still empty so it continues the process else returns null if moves are left it calls minimax again if its X turns it replaces each block with X one time and checks for best condition and same for O in its turn and finally returns the index of best move from the array by checking the maximum score possible in each case.
