// app.js

const reversi = require('./reversi.js');
const readlineSync = require('readline-sync');
const fs = require('fs');

let passedMoves = 0;

const endReversi = (board, playerLetter) => {
  const { X, O } = reversi.getLetterCounts(board);
  console.log(`Game Over\n\nScore\n=====\nX: ${X}\nO: ${O}\n`);

  if ((playerLetter === 'X' && X > O) || (playerLetter === 'O' && O > X)) {
    console.log('You won!');
  } else if (X !== O) { console.log('You lost!'); }
  else { console.log('Tie game!'); }

  process.exit();
};

const passMove = (board, playerLetter) => {
  passedMoves++;
  if (passedMoves >= 2) {
    endReversi(board, playerLetter);
  }
};

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
  const configFile = process.argv[2];
  if (configFile) { // user may have provided a config file
    getConfigFromFile(configFile);
  } else { // ask the user for config info
    getConfigFromUser();
  }
};

const makeMove = (board, moveLetter, move) => {
  const nextBoard = reversi.placeLetters(board, moveLetter, move);
  const { X, O } = reversi.getLetterCounts(nextBoard);

  console.log(reversi.boardToString(nextBoard));
  console.log(`Score\n=====\nX: ${X}\nO: ${O}\n`);

  return nextBoard;
};

const playerMove = (board, playerLetter) => {
  if (reversi.getValidMoves(board, playerLetter).length === 0) {
    readlineSync.question('No valid moves available for you. Press <ENTER> to pass.\n');
    passMove(board, playerLetter);
    return board;
  } else {
    const move = readlineSync('What\'s your move?\n');
    if (reversi.isValidMoveAlgebraicNotation(board, playerLetter, move)) {
      return makeMove(board, playerLetter, move);
    } else {
      console.log('INVALID MOVE. Your move should:\n* be in algebraic format\n* specify an existing empty cell\n* flip at atleast one of your oponent\'s pieces\n');
      return playerMove(board, playerLetter);
    }
  }
};

const computerMove = (board, playerLetter) => {
  readlineSync('Press <ENTER> to show computer\'s move...\n');

  const computerLetter = playerLetter === 'X' ? 'O' : 'X';
  const validMoves = reversi.getValidMoves(board, computerLetter);

  if (validMoves.length === 0) {
    readlineSync.question('Computer has no valid moves. Press <ENTER> to continue.\n');
    passMove(board, playerLetter);
    return board;
  } else {
    const move = validMoves[Math.floor(Math.random() * validMoves.length)];
    return makeMove(board, computerLetter, move);
  }
};

const scriptedMove = (board, moveLetter, move, playerLetter) => {
  const isPlayerMove = moveLetter === playerLetter ? true : false;
  const isNotScriptedMove = move === ' ' ? true : false;

  if (isNotScriptedMove && isPlayerMove) { return playerMove(board, playerLetter); }
  else if (isNotScriptedMove && !isPlayerMove) { return computerMove(board, playerLetter); }
  else {
    const mover = isPlayerMove ? 'Player' : 'Computer';
    if (reversi.isValidMoveAlgebraicNotation(board, moveLetter, move)) {
      readlineSync.question(`${mover} will move to ${move}. Press <Enter> to show the move.`);
      return makeMove(board, moveLetter, move);
    } else {
      readlineSync.question(`${mover}'s scripted move is invalid. Must make a different move instead.\nPress <Enter> to continue.`);
      if (isPlayerMove) { return playerMove(board, playerLetter); }
      else { return computerMove(board, playerLetter); }
    }
  }
};

const announceScriptedMoves = (player, computer) => {
  if (computer.length > 0) { console.log(`Computer will make the following moves ${computer}\n`);}
  if (player.length > 0) { console.log(`The player will make the following moves ${player}\n`);}
};

const playReversi = config => {
  const playerLetter = config.boardPreset.playerLetter;
  const { player, computer} = config.scriptedMoves;
  announceScriptedMoves(player, computer);

  const xMoves = playerLetter === 'X' ? player : computer;
  const oMoves = playerLetter === 'O' ? player : computer;
  const iterations = xMoves.length > oMoves.length ? xMoves.length : oMoves.length;

  const orderedMoves = [];
  for (let i = 0; i < iterations; i++) {
    const xMove = xMoves.length < iterations ? xMoves[i] : ' ';
    const oMove = oMoves.length < iterations ? oMoves[i] : ' ';
    orderedMoves.push({xMove, oMove});
  }

  let board = config.boardPreset.board;
  orderedMoves.foreach(({xMove, oMove}) => {
    board = scriptedMove(board, 'X', xMove, playerLetter);
    board = scriptedMove(board, 'O', oMove, playerLetter);
  });

  const xMove = playerLetter === 'X' ? (board, playerLetter) => playerMove(board, playerLetter) : computerMove(board, playerLetter);
  const oMove = playerLetter === 'O' ? (board, playerLetter) => playerMove(board, playerLetter) : computerMove(board, playerLetter);

  while (!reversi.isBoardFull(board)) {
    xMove(board, playerLetter);
    oMove(board, playerLetter);
  }
};

const run = () => playReversi(getConfig());

run();
