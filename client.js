const net = require("net");
const readline = require("readline");
const ora = require("ora");

/* Constants */
const NAME_CHANGE = "NAME_CHANGE";
const START_GAME = "START_GAME";
const GAME_MESSAGE = "GAME_MESSAGE";
const SHOW_GAME_BOARD = "SHOW_GAME_BOARD";
const GAME_MOVE = "GAME_MOVE";

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

let SERVER_ADDRESS = null;
let SERVER_PORT = null;

var client = new net.Socket();

askForServerAddress();

function askForServerAddress() {
  readMove.question(`\nEnter server address ( 127.0.0.1:1337 ) : `, address => {
    if (address) {
      const serverAddress = address.split(":");
      SERVER_ADDRESS = serverAddress[0];
      SERVER_PORT = serverAddress[1];
      connecToTheServer();
    } else {
      askForServerAddress();
    }
  });
}

function connecToTheServer() {
  client.connect(
    SERVER_PORT,
    SERVER_ADDRESS,
    function() {
      console.log("Connected");
    }
  );
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
    if (payload.spinner === true) {
      showMessageWithSpinner(payload.message);
    } else {
      console.log(`\n${payload.message}`);
    }
  }
  if (type === SHOW_GAME_BOARD) {
    showGameBoard(payload.board);
  }
  if (type === GAME_MOVE) {
    if (payload.ask === true) {
      chooseTheMove();
    } else {
      showMessageWithSpinner(`Waiting Player ${payload.oppPose} to move`);
    }
  }
});

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
    client.write(
      JSON.stringify({
        payload: {
          move: gameIndex
        },
        type: GAME_MOVE
      })
    );
  }
}

function handleNameChange(playerName) {
  gameFlow.steps.askName = true;
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

let cliSpinner;
function showMessageWithSpinner(message) {
  cliSpinner = ora({
    text: message,
    spinner: "dots"
  }).start();
}

function stopTheSpinner() {
  if (cliSpinner) {
    cliSpinner.stop();
  }
}

function showGameBoard(gameBoard) {
  stopTheSpinner();
  clearTheScreen();
  console.log(gameBoard);
}

function clearTheScreen() {
  console.log(blank);
  readline.cursorTo(process.stdout, 0, 0);
  readline.clearScreenDown(process.stdout);
}

client.on("close", function() {
  console.log("Connection closed");
});

client.on("error", function(err) {
  console.log(
    "\n************* Error on connecting to the server *************"
  );
  console.log(err);
  console.log(
    "************* Error on connecting to the server *************\n"
  );
  askForServerAddress();
});
