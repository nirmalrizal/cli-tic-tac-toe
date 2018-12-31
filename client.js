var net = require("net");

const readline = require("readline");

const readMove = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
const blank = "\n".repeat(process.stdout.rows);

let SERVER_ADDRESS = "127.0.0.1";
let SERVER_PORT = 1337;

var client = new net.Socket();
client.connect(
  SERVER_PORT,
  SERVER_ADDRESS,
  function() {
    console.log("Connected");
    chooseTheMove();
  }
);

function chooseTheMove() {
  readMove.question(`\nWhat's your move : `, move => {
    handleTheMove(move);
  });
}

function handleTheMove(data) {
  client.write(data);
}

client.on("data", function(data) {
  const strData = data.toString();
  console.log(strData);
  chooseTheMove();
});

client.on("close", function() {
  console.log("Connection closed");
});
