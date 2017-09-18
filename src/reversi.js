// reversi.js

module.exports = {
  repeat: function(value, n) {
    return new Array(n).fill(value);
  },

  generateBoard: function(rows, columns, initialCellValue=" ") {
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
  }
};
