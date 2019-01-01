function printResult(moves) {
  return `
  \n\n
  + --------------------------- +
  |    ${moves["1"]}    |    ${moves["2"]}    |    ${moves["3"]}    |
  + ------- + ------- + ------- +
  |    ${moves["4"]}    |    ${moves["5"]}    |    ${moves["6"]}    |
  + ------- + ------- + ------- +
  |    ${moves["7"]}    |    ${moves["8"]}    |    ${moves["9"]}    |
  + --------------------------- +
  \n\n
  `;
}

module.exports = printResult;
