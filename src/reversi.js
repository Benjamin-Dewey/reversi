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
  },

  algebraicToRowCol: function(algebraicNotation) {
    const getRowColFromChars = (chars) => {
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
          return undefined;
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
            return undefined;
          }
          return undefined;
        }
      }
      return undefined;
    }
    return undefined;
  }
};
