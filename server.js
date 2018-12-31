var net = require("net");

/* Constants */
const NAME_CHANGE = "NAME_CHANGE";
const START_GAME = "START_GAME";
const GAME_MESSAGE = "GAME_MESSAGE";

const blank = "\n".repeat(process.stdout.rows);
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

const connectedSockets = new Set();
const clients = [];

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
      } else {
        const strData = data.toString();
        console.log(strData);
        const player = getClientIndex(clients, socket);
        console.log(`Player ${player}`);
        broadcastData(
          JSON.stringify({
            payload: {
              move: strData
            },
            type: START_GAME
          }),
          socket
        );
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
          message: "Waiting for Player 2 to connect..."
        },
        type: GAME_MESSAGE
      }),
      clients[0].socket
    );
  }
  if (clients.length === 2) {
    const checkNameChange = clients.filter(cli => cli.nameChanged === false);
    if (checkNameChange.length === 0) {
      startMainGame();
    }
    if (checkNameChange.length === 1) {
      let eligPlayer = clients[0].socket;
      if (checkNameChange.pos === 1) {
        eligPlayer = clients[1].socket;
      }
      broadcastData(
        JSON.stringify({
          payload: {
            message: `Waiting for Player ${checkNameChange.pos} for name change`
          },
          type: GAME_MESSAGE
        }),
        eligPlayer
      );
    }
  }
}

function startMainGame() {
  console.log("Start the main game man");
}

function getClientIndex(clients, sock) {
  var client = clients.find(cliSock => cliSock.socket === sock);
  return client.pos;
}

const PORT = process.env.PORT || 1337;
server.listen(PORT);
