const net = require("net");
const path = require("path");

/* Constants */
const NAME_CHANGE = "NAME_CHANGE";
const START_GAME = "START_GAME";
const GAME_MESSAGE = "GAME_MESSAGE";
const SHOW_GAME_BOARD = "SHOW_GAME_BOARD";
const GAME_MOVE = "GAME_MOVE";
const GAME_DRAW = "GAME_DRAW";

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

    socket.on("end", function(data) {
      try {
        const player = getClientIndex(clients, socket);
        clients.splice(player - 1, 1);
      } catch (err) {
        console.log("Error on end connection");
      }
    });

    socket.on("error", function(error) {
      try {
        const player = getClientIndex(clients, socket);
        clients.splice(player - 1, 1);
      } catch (err) {
        console.log("Error on connection");
      }
    });

    socket.on("data", function(data) {
      try {
        const parsedData = JSON.parse(data.toString());
        const { type, payload } = parsedData;
        if (type === NAME_CHANGE) {
          handleNameChange(payload);
        }
        if (type === GAME_MOVE) {
          playerMovesArr.push(payload.move);
          if (payload.pos === 1) {
            movesArr[payload.move] = "*";
          } else {
            movesArr[payload.move] = "#";
          }
          showGameBoardToPlayers();
        }
      } catch (e) {
        console.log("Cannot handle data");
        socket.end("Request from browser");
      }
    });
  }
});

function handleNameChange(data) {
  const { name, pos } = data;
  clients[pos - 1].name = name;
  clients[pos - 1].nameChanged = true;
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
      showGameBoardToPlayers();
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
  if (checkGameWin("*") === true) {
    announceWinnerAndLoser(1, 2);
  } else if (checkGameWin("#") === true) {
    announceWinnerAndLoser(2, 1);
  } else if (checkGameWin(" ") === "draw") {
    announceWinnerAndLoser(1, 2, true);
  } else {
    askPlayersForMove();
  }
}

function showGameBoardToPlayers() {
  clients.forEach(client => {
    broadcastData(
      JSON.stringify({
        payload: {
          board: movesArr
        },
        type: SHOW_GAME_BOARD
      }),
      client.socket
    );
  });
  setTimeout(function() {
    resumeMainGame();
  }, 200);
}

function askPlayersForMove() {
  const isMovesEven = playerMovesArr.length % 2;
  let activePos = 2;
  let passivePos = 1;
  if (isMovesEven === 0) {
    activePos = 1;
    passivePos = 2;
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

function announceWinnerAndLoser(winner, looser, draw) {
  const winnerMessage = !draw ? "You won !!!" : "The game is draw";
  const looserMessage = !draw ? "You lose the game !!!" : "The game is draw";
  broadcastData(
    JSON.stringify({
      payload: {
        message: winnerMessage,
        spinner: false
      },
      type: GAME_MESSAGE
    }),
    clients[winner - 1].socket
  );
  broadcastData(
    JSON.stringify({
      payload: {
        message: looserMessage,
        spinner: false
      },
      type: GAME_MESSAGE
    }),
    clients[looser - 1].socket
  );
}

const winningPosAList = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
  [1, 4, 7],
  [2, 5, 8],
  [3, 6, 9],
  [1, 5, 9],
  [3, 5, 7]
];

function checkGameWin(symbol) {
  const moves = { ...movesArr };
  for (let i = 0; i < winningPosAList.length; i += 1) {
    const win = winningPosAList[i];
    if (
      moves[win[0]] === symbol &&
      moves[win[1]] === symbol &&
      moves[win[2]] === symbol
    ) {
      return true;
    }
  }
  if (playerMovesArr.length === 9) {
    return GAME_DRAW;
  }
  return false;
}

function getClientIndex(clients, sock) {
  var client = clients.find(cliSock => cliSock.socket === sock);
  return client.pos;
}

const PORT = process.env.PORT || 1337;

server.listen(PORT, function(err) {
  require("dns").lookup(require("os").hostname(), function(err, add, fam) {
    console.log(`
    + ----------------------------------------- +
    |                                           
    |    Server Address : ${add}:${PORT}     
    |                                           
    + ----------------------------------------- +
  `);
  });
});
