// app.js

const reversi = require('./reversi.js');
const readlineSync = require('readline-sync');
const fs = require('fs');

let consecutivePassedMoves = 0;

const endReversi = (board, playerLetter) => {
  const { X, O } = reversi.getLetterCounts(board);
  console.log(`Game Over\n\nScore\n=====\nX: ${X}\nO: ${O}\n`);

  if ((playerLetter === 'X' && X > O) || (playerLetter === 'O' && O > X)) {
    console.log('You won!\n');
  } else if (X !== O) { console.log('You lost!\n'); }
  else { console.log('Tie game!\n'); }

  console.log('\n==================\n\n');

  process.exit();
};

const passMove = (board, playerLetter) => {
  consecutivePassedMoves++;
  if (consecutivePassedMoves >= 2) {
    endReversi(board, playerLetter);
  }
};

const getConfigFromFile = (file, callback) => {
  fs.readFile(file, 'utf8', (err, data) => {
    if (err) {
      console.log(err);
      process.exit();
    } else {
      callback(JSON.parse(data));
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

  console.log('\n==================\n\nWelcome to Reversi.\n');
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

const getConfig = (callback) => {
  const configFile = process.argv[2];
  if (configFile) { // user may have provided a config file
    return getConfigFromFile(configFile, callback);
  } else { // ask the user for config info
    callback(getConfigFromUser());
  }
};

const makeMove = (board, moveLetter, move) => {
  const { row, col } = move;
  let nextBoard = reversi.setBoardCell(board, moveLetter, row, col);
  nextBoard = reversi.flipCells(nextBoard, reversi.getCellsToFlip(nextBoard, row, col));
  const { X, O } = reversi.getLetterCounts(nextBoard);

  console.log(reversi.boardToString(nextBoard));
  console.log(`Score\n=====\nX: ${X}\nO: ${O}\n`);

  consecutivePassedMoves = 0;
  return nextBoard;
};

const playerMove = (board, playerLetter) => {
  if (reversi.getValidMoves(board, playerLetter).length === 0) {
    readlineSync.question('No valid moves available for you. Press <ENTER> to pass.\n> ');
    passMove(board, playerLetter);
    return board;
  } else {
    const move = readlineSync.question('What\'s your move?\n> ');
    if (reversi.isValidMoveAlgebraicNotation(board, playerLetter, move)) {
      return makeMove(board, playerLetter, reversi.algebraicToRowCol(move));
    } else {
      console.log('\nINVALID MOVE. Your move should:\n* be in algebraic format\n* specify an existing empty cell\n* flip at at least one of your oponent\'s pieces\n');
      return playerMove(board, playerLetter);
    }
  }
};

const computerMove = (board, playerLetter) => {
  readlineSync.question('Press <ENTER> to show computer\'s move...\n> ');

  const computerLetter = playerLetter === 'X' ? 'O' : 'X';
  const validMoves = reversi.getValidMoves(board, computerLetter);

  if (validMoves.length === 0) {
    readlineSync.question('Computer has no valid moves. Press <ENTER> to continue.\n> ');
    passMove(board, playerLetter);
    return board;
  } else {
    const [row, col] = validMoves[Math.floor(Math.random() * validMoves.length)];
    return makeMove(board, computerLetter, {row, col});
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
      readlineSync.question(`${mover} will move to ${move}. Press <Enter> to show the move.\n> `);
      return makeMove(board, moveLetter, reversi.algebraicToRowCol(move));
    } else {
      readlineSync.question(`${mover}'s scripted move is invalid. Must make a different move instead.\nPress <Enter> to continue.\n> `);
      if (isPlayerMove) { return playerMove(board, playerLetter); }
      else { return computerMove(board, playerLetter); }
    }
  }
};

const announceScriptedMoves = (player, computer, playerLetter) => {
  if (computer.length > 0 || player.length > 0) {
    const computerLetter = playerLetter === 'X' ? 'O' : 'X';

    console.log(`\n==================\n\nWelcome to Reversi.\n\nThe computer is ${computerLetter}.\nThe player is ${playerLetter}.\n`);
  }
  if (computer.length > 0) { console.log(`Computer will make the following moves ${computer}\n`); }
  if (player.length > 0) { console.log(`The player will make the following moves ${player}\n`); }
};

const playReversi = config => {
  const playerLetter = config.boardPreset.playerLetter;
  const { player, computer} = config.scriptedMoves;
  announceScriptedMoves(player, computer, playerLetter);

  const xMoves = playerLetter === 'X' ? player : computer;
  const oMoves = playerLetter === 'O' ? player : computer;
  const iterations = xMoves.length > oMoves.length ? xMoves.length : oMoves.length;

  const orderedMoves = [];
  for (let i = 0; i < iterations; i++) {
    const xMove = i < xMoves.length ? xMoves[i] : ' ';
    const oMove = i < oMoves.length ? oMoves[i] : ' ';
    orderedMoves.push({xMove, oMove});
  }

  if (orderedMoves.length === 0) {
    const computerLetter = playerLetter === 'X' ? 'O' : 'X';
    console.log(`\n==================\n\nWelcome to Reversi.\n\nThe computer is ${computerLetter}.\nThe player is ${playerLetter}.\n`);
  }

  let board = config.boardPreset.board;

  console.log(reversi.boardToString(board));

  orderedMoves.forEach(({xMove, oMove}) => {
    board = scriptedMove(board, 'X', xMove, playerLetter);
    board = scriptedMove(board, 'O', oMove, playerLetter);
  });

  const xMove = playerLetter === 'X' ?
    (board, playerLetter) => playerMove(board, playerLetter) : (board, playerLetter) => computerMove(board, playerLetter);
  const oMove = playerLetter === 'O' ?
    (board, playerLetter) => playerMove(board, playerLetter) : (board, playerLetter) => computerMove(board, playerLetter);

  while (!reversi.isBoardFull(board)) {
    board = xMove(board, playerLetter);
    if (reversi.isBoardFull(board)) { break; }
    board = oMove(board, playerLetter);
  }

  endReversi(board, playerLetter);
};

const run = () => getConfig((config) => playReversi(config));

run();
