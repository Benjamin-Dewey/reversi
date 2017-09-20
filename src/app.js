// app.js

const reversi = require('./reversi.js');
const readlineSync = require('readline-sync');
const fs = require('fs');



const getConfigFromFile = file => {
  fs.readFile(file, 'utf8', (err, data) => {
    if (!err) { // user provided a config file
      return JSON.parse(data);
    } else {
      // there is an error
      process.exit(1);
    }
  });
};

const getConfigFromUser = () => {
  const boardWidthIsInvalid = (boardWidth) => {
    boardWidth = Number(boardWidth);
    if (isNaN(boardWidth) || boardWidth % 2 !== 0 || boardWidth < 4 || boardWidth > 26) {
      return true;
    }
    return false;
  };

  const playerLetterIsInvalid = playerLetter => playerLetter !== 'X' && playerLetter !== 'O';

  console.log('\nWelcome to Reversi.\n');
  let boardWidth;
  while (boardWidthIsInvalid(boardWidth)) {
    boardWidth = readlineSync.question('How wide should the board be? (even numbers between 4 and 26, inclusive)\n> ');
  }

  let playerLetter;
  while (playerLetterIsInvalid(playerLetter)) {
    playerLetter = readlineSync.question('Pick your letter: X (black) or O (white)\n> ');
  }
  console.log(`Player is ${playerLetter}\n`);

  const halfWidth = boardWidth / 2;
  let board = reversi.generateBoard(boardWidth, boardWidth, ' ');
  board = reversi.setBoardCell(board, 'O', halfWidth, halfWidth);
  board = reversi.setBoardCell(board, 'O', halfWidth - 1, halfWidth - 1);
  board = reversi.setBoardCell(board, 'X', halfWidth - 1, halfWidth);
  board = reversi.setBoardCell(board, 'X', halfWidth, halfWidth - 1);

  return {
    boardPreset: {
      playerLetter,
      board
    },
    scriptedMoves: {
      player: [],
      computer: []
    }
  };
};

const getConfig = () => {
  if (process.argv[2]) { // user may have provided a config file
    getConfigFromFile(process.argv[2]);
  } else { // ask the user for config info
    getConfigFromUser();
  }
};


const playReversi = config => {

};

const runApp = () => {
  playReversi(getConfig());
};
