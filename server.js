const net = require("net");
const printResult = require("./printResult");

/* Constants */
const NAME_CHANGE = "NAME_CHANGE";
const START_GAME = "START_GAME";
const GAME_MESSAGE = "GAME_MESSAGE";
const SHOW_GAME_BOARD = "SHOW_GAME_BOARD";
const GAME_MOVE = "GAME_MOVE";

const movesArr = {
  "1": "1",
  "2": "2",
  "3": "3",
  "4": "4",
  "5": "5",
  "6": "6",
  "7": "7",
  "8": "8",
  "9": "9"
};

const clients = [];
let playerMovesArr = [];

const broadcastData = function(data, client) {
  client.write(data);
};

var server = net.createServer(function(socket) {
  const clientsSize = clients.length;
  if (clientsSize === 2) {
    socket.end("Maximum connections");
  } else {
    console.log("new client connected");
    const playerPos = clientsSize + 1;
    clients.push({
      name: `Player ${playerPos}`,
      socket,
      moves: [],
      pos: playerPos,
      nameChanged: false
    });
    broadcastData(
      JSON.stringify({
        payload: {
          player: playerPos
        },
        type: START_GAME
      }),
      socket
    );

    socket.on("end", function() {
      console.log("Connection ended");
      const player = getClientIndex(clients, socket);
      clients.splice(player - 1, 1);
    });

    socket.on("error", function(error) {
      console.log("Connection error");
      const player = getClientIndex(clients, socket);
      clients.splice(player - 1, 1);
    });

    socket.on("data", function(data) {
      const parsedData = JSON.parse(data.toString());
      const { type, payload } = parsedData;
      if (type === NAME_CHANGE) {
        handleNameChange(payload);
      }
      if (type === GAME_MOVE) {
        playerMovesArr.push(payload.move);
        movesArr[payload.move] = "*";
        resumeMainGame();
      }
    });
  }
});

function handleNameChange(data) {
  const { name, pos } = data;
  clients[pos - 1].name = name;
  clients[pos - 1].nameChanged = true;
  console.log(`\nPlayer ${pos} changed name to : ${name}`);
  checkUserStatusAndStartGame();
}

function checkUserStatusAndStartGame() {
  if (clients.length === 1) {
    broadcastData(
      JSON.stringify({
        payload: {
          message: "Waiting for Player 2 to connect",
          spinner: true
        },
        type: GAME_MESSAGE
      }),
      clients[0].socket
    );
  }
  if (clients.length === 2) {
    const checkNameChange = clients.filter(cli => cli.nameChanged === false);
    if (checkNameChange.length === 0) {
      resumeMainGame();
    }
    if (checkNameChange.length === 1) {
      let eligPlayer = clients[0].socket;
      if (checkNameChange[0].pos === 1) {
        eligPlayer = clients[1].socket;
      }
      broadcastData(
        JSON.stringify({
          payload: {
            message: `Waiting Player ${checkNameChange[0].pos} for name change`,
            spinner: true
          },
          type: GAME_MESSAGE
        }),
        eligPlayer
      );
    }
  }
}

function resumeMainGame() {
  showGameBoardToPlayers();
  askPlayersForMove();
}

function showGameBoardToPlayers() {
  clients.forEach(client => {
    broadcastData(
      JSON.stringify({
        payload: {
          board: printResult(movesArr)
        },
        type: SHOW_GAME_BOARD
      }),
      client.socket
    );
  });
}

function askPlayersForMove() {
  const isMovesEven = playerMovesArr.length % 2;
  let activePos = 1;
  let passivePos = 2;
  if (isMovesEven === 0) {
    activePos = 2;
    passivePos = 1;
  }
  /* Ask player move */
  broadcastData(
    JSON.stringify({
      payload: {
        ask: true,
        oppPose: passivePos
      },
      type: GAME_MOVE
    }),
    clients[activePos - 1].socket
  );

  /* Ask player to wait */
  broadcastData(
    JSON.stringify({
      payload: {
        ask: false,
        oppPose: activePos
      },
      type: GAME_MOVE
    }),
    clients[passivePos - 1].socket
  );
}

function getClientIndex(clients, sock) {
  var client = clients.find(cliSock => cliSock.socket === sock);
  return client.pos;
}

const PORT = process.env.PORT || 1337;
server.listen(PORT);
