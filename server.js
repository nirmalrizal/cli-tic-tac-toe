var net = require("net");

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
  for (let sock of this) {
    if (sock === client) {
      sock.write(data);
    }
  }
};

var server = net.createServer(function(socket) {
  const clientsSize = clients.length;
  console.log(clientsSize);
  if (clientsSize === 2) {
    socket.end("Maximum connections");
  } else {
    console.log("new client connected");
    // connectedSockets.add(socket);
    clients.push({
      name: null,
      socket,
      moves: [],
      pos: clientsSize + 1
    });

    socket.on("end", function() {
      console.log("Connection ended");
      const player = getClientIndex(clients, socket);
      // connectedSockets.delete(socket);
      clients.splice(player - 1, 1);
    });

    socket.on("error", function(error) {
      console.log("Connection error");
      const player = getClientIndex(clients, socket);
      // connectedSockets.delete(socket);
      clients.splice(player - 1, 1);
    });

    socket.on("data", function(data) {
      const strData = data.toString();
      console.log(strData);
      const player = getClientIndex(clients, socket);
      console.log(`Player ${player}`);
      broadcastData(strData, socket);
    });
  }
});

function getClientIndex(clients, sock) {
  var client = clients.find(cliSock => cliSock.socket === sock);
  return client.pos;
}

const PORT = process.env.PORT || 1337;
server.listen(PORT);
