var net = require("net");

const connectedSockets = new Set();
const clients = [];

connectedSockets.broadcast = function(data, client) {
  for (let sock of this) {
    if (sock === client) {
      sock.write(data);
    }
  }
};

var server = net.createServer(function(socket) {
  const clientsSize = connectedSockets.size;
  if (Number(clientsSize) === 2) {
    socket.end("Maximum connections");
  } else {
    console.log("new client connected");
    connectedSockets.add(socket);
    clients.push({
      name: null,
      socket,
      moves: [],
      pos: clientsSize + 1
    });

    socket.on("end", function() {
      connectedSockets.delete(socket);
    });

    socket.on("data", function(data) {
      const strData = data.toString();
      console.log(strData);
      const player = getClientIndex(clients, socket);
      console.log(`Player ${player}`);
      connectedSockets.broadcast(strData, socket);
    });
  }
});

function getClientIndex(clients, sock) {
  var client = clients.find(cliSock => cliSock.socket === sock);
  return client.pos;
}

const PORT = process.env.PORT || 1337;
server.listen(PORT);
