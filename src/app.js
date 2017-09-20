// app.js

const reversi = require('./reversi.js');
const readlineSync = require('readline-sync');
const fs = require('fs');

if (process.argv[2]) { // user may have provided a config file
  fs.readFile(process.argv[2], 'utf8', (err, data) => {
    if (!err) { // user provided a config file
      const config = JSON.parse(data);
      // generate board using config and begin the game

    } else {
      // there is an error
    }
  });
} else { // ask the user for config info
  const boardWidthIsInvalid = (boardWidth) => {
    boardWidth = Number(boardWidth);
    if (isNaN(boardWidth) || boardWidth % 2 !== 0 || boardWidth < 4 || boardWidth > 26) {
      return true;
    }
    return false;
  };

  const playerLetterIsInvalid = playerLetter => playerLetter !== 'X' && playerLetter !== 'O';

  console.log('Welcome to Reversi.');
  let boardWidth;
  while (boardWidthIsInvalid(boardWidth)) {
    boardWidth = readlineSync.question('How wide should the board be? (even numbers between 4 and 26, inclusive)');
  }

  let playerLetter;
  while (playerLetterIsInvalid(playerLetter)) {
    playerLetter = readlineSync.question('Pick your letter: X (black) or O (white)');
  }
  console.log(`Player is ${playerLetter}`);

}
