import * as net from "net";

const server = net.createServer((socket) => {
  socket.on("connect", () => {
    console.log("connected");
  });
  socket.on("close", () => {
    socket.end();
  });
  socket.on("data", () => {
    socket.write("HTTP/1.1 200 OK\r\n\r\n");
  });
});

server.listen(4221, "localhost");
