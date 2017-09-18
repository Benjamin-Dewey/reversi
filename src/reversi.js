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
  }
};
