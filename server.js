var net = require("net");

const connectedSockets = new Set();

connectedSockets.broadcast = function(data, client) {
  for (let sock of this) {
    if (sock === client) {
      sock.write(data);
    }
  }
};

var server = net.createServer(function(socket) {
  if (Number(connectedSockets.size) === 2) {
    socket.end("Maximum connections");
  } else {
    console.log("new client connected");
    connectedSockets.add(socket);
    console.log(connectedSockets[0]);

    socket.on("end", function() {
      connectedSockets.delete(socket);
    });

    socket.on("data", function(data) {
      const strData = data.toString();
      console.log(strData);
      connectedSockets.broadcast(strData, socket);
    });
  }
});

const PORT = process.env.PORT || 1337;
server.listen(PORT);
