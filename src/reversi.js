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
    const characters = algebraicNotation.split('');
    const length = characters.length;

    let firstCharIsValid = false;
    let secondCharIsValid = false;
    let thirdCharIsValid = false;
    const lengthIsValid = length > 1 && length < 4;

    if (lengthIsValid) {
      firstCharIsValid = /[A-z]/.test(characters[0]);

      if (firstCharIsValid) {

        if (length === 2) {

          secondCharIsValid = /[1-9]/.test(characters[1])

          if (secondCharIsValid) {
            return {
              row: Number(characters[0]) - 1,
              column: characters[1].toUpperCase() - 65
            };
          }
          return undefined
        }
        if (length === 3) {

          secondCharIsValid = /[1-2]/.test(characters[1])

          if (secondCharIsValid) {

            if (characters[1] === '1') {

              thirdCharIsValid = /[0-9]/.test(characters[2])
            }

            else if (characters[1] === '2') {

              thirdCharIsValid = /[0-6]/.test(characters[2])
            }
          }
          return undefined;
        }
      }
      return undefined;
    }
    return undefined;
  }
};
