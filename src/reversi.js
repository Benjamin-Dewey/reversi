// reversi.js

module.exports = {
  repeat: function(value, n) {
    return new Array(n).fill(value);
  },

  generateBoard: function(rows, columns, initialCellValue=' ') {
    return this.repeat(initialCellValue, rows * columns);
  },

  rowColToIndex: function(board, rowNumber, columnNumber) {
    return (Math.sqrt(board.length) * rowNumber) + columnNumber;
  },

  indexToRowCol: function(board, i) {
    const boardLength = Math.sqrt(board.length);
    const row = Math.floor(i / boardLength);
    const col = i - (row * boardLength);
    return { row, col };
  },

  setBoardCell: function(board, letter, row, col) {
    const nextBoard = [...board];
    nextBoard[this.rowColToIndex(nextBoard, row, col)] = letter;
    return nextBoard;
  },

  algebraicToRowCol: function(algebraicNotation) {
    const getRowColFromChars = chars => {
      return {
        row: Number(chars[1]) - 1,
        col: chars[0].toUpperCase().charCodeAt() - 65
      };
    };

    const chars = algebraicNotation.split('');
    const length = chars.length;

    if (length > 1 && length < 4) {
      let firstCharIsValid = false;
      let secondCharIsValid = false;
      let thirdCharIsValid = false;

      firstCharIsValid = /[A-z]/.test(chars[0]);
      if (firstCharIsValid) {
        if (length === 2) {
          secondCharIsValid = /[1-9]/.test(chars[1]);
          if (secondCharIsValid) {
            return getRowColFromChars(chars);
          }
        }
        if (length === 3) {
          secondCharIsValid = /[1-2]/.test(chars[1]);
          if (secondCharIsValid) {
            if (chars[1] === '1') {
              thirdCharIsValid = /[0-9]/.test(chars[2]);
            }
            if (chars[1] === '2') {
              thirdCharIsValid = /[0-6]/.test(chars[2]);
            }
            if (thirdCharIsValid) {
              return getRowColFromChars(chars);
            }
          }
        }
      }
    }
    return undefined;
  },

  placeLetters: function(board, letter, ...algebraicNotation) {
    return algebraicNotation.reduce((nextBoard, move) => {
      const rowCol = this.algebraicToRowCol(move);
      return this.setBoardCell(nextBoard, letter, rowCol.row, rowCol.col);
    }, board);
  },

  boardToString: function(board) {

    const boardLength = Math.sqrt(board.length);
    let boardAsString = '  ';

    for (let i = 0; i < boardLength; i++) {
      boardAsString += '   ' + String.fromCharCode(i + 65);
    }
    boardAsString += '  \n';

    let edge = '   ';
    for (let i = 0; i < boardLength; i++) {
      edge += '+---';
    }
    edge += '+\n';

    let curRow = 1;

    for (let i = 0; i < board.length; i++) {
      if ((i % boardLength) === 0 ) {
        boardAsString += edge;
        boardAsString += ' ' + curRow + ' ';
        curRow++;
      }
      boardAsString += `| ${board[i]} `;
      if(((i + 1) % boardLength) === 0) { boardAsString += '|\n'; }
    }

    boardAsString += edge;
    return boardAsString;
  },

  isBoardFull: function(board) {
    return !board.some(cell => cell === ' ');
  },

  flip: function(board, row, col) {
    if (board[this.rowColToIndex(board, row, col)] === 'X') {
      return this.setBoardCell(board, 'O', row, col);
    } else if (board[this.rowColToIndex(board, row, col)] === 'O') {
      return this.setBoardCell(board, 'X', row, col);
    } else {
      return board;
    }
  },

  flipCells: function(board, cellsToFlip) {
    return cellsToFlip.reduce((nextBoard, cellGroup) => {
      return cellGroup.reduce((nextBoard, rowCol) => {
        return this.flip(nextBoard, rowCol[0], rowCol[1]);
      }, nextBoard);
    }, board);
  },

  getCellsToFlip: function(board, lastRow, lastCol) {
    const enemyCell = board[this.rowColToIndex(board, lastRow, lastCol)] === 'X' ? 'O' : 'X';
    const boardLength = Math.sqrt(board.length);

    const rowColAreInBounds = (row, col) => {
      return (row < boardLength && row > -1) && (col < boardLength && col > -1);
    };

    const getCellsForLinearShiftOnAxis = (shift, axis) => {
      let cells = [];

      let row, col, index;
      const axisIsX = axis === 'x';
      if (axisIsX) {
        row = lastRow;
        col = lastCol + shift;
      } else {
        row = lastRow + shift;
        col = lastCol;
      }

      while (rowColAreInBounds(row, col)) {
        index = this.rowColToIndex(board, row, col);
        if (board[index] === enemyCell) {
          cells.push([row, col]);
        } else {
          if (board[index] === ' ') {
             cells = [];
          }
          break;
        }
        if (axisIsX) { col += shift; }
        else { row += shift; }
      }

      if (!rowColAreInBounds(row, col)) {cells = [];}

      return cells;
    };

    const getCellsForDiagonalShifts = (xShift, yShift) => {
      let row = lastRow + yShift;
      let col = lastCol + xShift;
      let cells = [];
      let index;

      while (rowColAreInBounds(row, col)) {
        index = this.rowColToIndex(board, row, col);
        if (board[index] === enemyCell) {
          cells.push([row, col]);
        } else {
          if (board[index] === ' ') {
             cells = [];
          }
          break;
        }
        row += yShift;
        col += xShift;
      }

      if (!rowColAreInBounds(row, col)) {cells = [];}

      return cells;
    };

    return [
      getCellsForLinearShiftOnAxis(1, 'x'),
      getCellsForLinearShiftOnAxis(-1, 'x'),
      getCellsForLinearShiftOnAxis(1, 'y'),
      getCellsForLinearShiftOnAxis(-1, 'y'),
      getCellsForDiagonalShifts(1, -1),
      getCellsForDiagonalShifts(-1, -1),
      getCellsForDiagonalShifts(1, 1),
      getCellsForDiagonalShifts(-1, 1)
    ].filter(cellGroup => cellGroup.length > 0);
  },

  isValidMove: function(board, letter, row, col) {
    if ((row < board.length && row > -1) && (col < board.length && col > -1)) {
      if (board[this.rowColToIndex(board, row, col)] === ' ') {
        const nextBoard = this.setBoardCell(board, letter, row, col);
        if (this.getCellsToFlip(nextBoard, row, col).length > 0) {
          return true;
        }
      }
    }
    return false;
  },

  isValidMoveAlgebraicNotation: function(board, letter, algebraicNotation) {
    const rowCol = this.algebraicToRowCol(algebraicNotation);
    return this.isValidMove(board, letter, rowCol.row, rowCol.col);
  },

  getLetterCounts: function(board) {
    const X = board.reduce((count, cell) => cell === 'X' ? count + 1 : count, 0);
    const O = board.reduce((count, cell) => cell === 'O' ? count + 1 : count, 0);
    return {X, O};
  },

  getValidMoves: function(board, letter) {
    return board.reduce((validMoves, curVal, curIndex) => {
      const rowCol = this.indexToRowCol(board, curIndex);
      return this.isValidMove(board, letter, rowCol.row, rowCol.col) ? [...validMoves, [rowCol.row, rowCol.col]] : validMoves;
    }, []);
  }
};
