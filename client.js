var net = require("net");
const readline = require("readline");

/* Constants */
const NAME_CHANGE = "NAME_CHANGE";
const START_GAME = "START_GAME";
const GAME_MESSAGE = "GAME_MESSAGE";

const readMove = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
const blank = "\n".repeat(process.stdout.rows);

const gameFlow = {
  name: null,
  pos: null,
  steps: {
    askName: false
  }
};

let SERVER_ADDRESS = "127.0.0.1";
let SERVER_PORT = 1337;

var client = new net.Socket();
client.connect(
  SERVER_PORT,
  SERVER_ADDRESS,
  function() {
    console.log("Connected");
    // chooseTheMove();
  }
);

function chooseTheMove() {
  const { steps, name } = gameFlow;
  if (!steps.askName) {
    readMove.question(`\nWhat's your name ( ${name} ) : `, playerName => {
      handleNameChange(playerName);
    });
  } else {
    readMove.question(`\nWhat's your move : `, move => {
      handleTheMove(move);
    });
  }
}

function handleTheMove(data) {
  const gameIndex = Number(data);
  const isInValidIndex = gameIndex < 1 || gameIndex > 9;
  if (Number.isNaN(gameIndex) || isInValidIndex) {
    console.log("Invalid move !!");
    chooseTheMove();
  } else {
    client.write(data);
  }
}

function handleNameChange(playerName) {
  if (playerName) {
    gameFlow.name = playerName;
  }
  const { name, pos } = gameFlow;
  client.write(
    JSON.stringify({
      payload: {
        name,
        pos
      },
      type: NAME_CHANGE
    })
  );
  console.log(`\nYour game name : ${name}`);
}

client.on("data", function(data) {
  const parsedData = JSON.parse(data.toString());
  const { type, payload } = parsedData;
  if (type === START_GAME) {
    gameFlow.name = `Player ${payload.player}`;
    gameFlow.pos = payload.player;
    chooseTheMove();
  }
  if (type === GAME_MESSAGE) {
    console.log(`\n${payload.message}`);
  }
  if (type === "move") {
    console.log(payload.move);
    chooseTheMove();
  }
});

client.on("close", function() {
  console.log("Connection closed");
});
