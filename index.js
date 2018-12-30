const printResult = require("./printResult");
const readline = require('readline');

const readMove = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
const blank = '\n'.repeat(process.stdout.rows);

let movesArr = {
    '1': '1',
    '2': '2',
    '3': '3',
    '4': '4',
    '5': '5',
    '6': '6',
    '7': '7',
    '8': '8',
    '9': '9'
}

function chooseTheMove(){
  readMove.question(`What's your move : `, (move) => {
    handleTheMove(move);
  });
}

function handleTheMove(data){
  console.log(data);
  movesArr[data] = "*";
  clearTheScreen();
  printResult(movesArr);
  chooseTheMove();
}

printResult(movesArr);
chooseTheMove();

function clearTheScreen(){
  console.log(blank);
  readline.cursorTo(process.stdout, 0, 0);
  readline.clearScreenDown(process.stdout);
}


process.stdin.resume();
