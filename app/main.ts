import * as net from "net";

const CRLF = '\r\n';

const extractRequestLine = (httpRequest: string) => {
  const [requestLine, ..._headersAndBody] = httpRequest.split(CRLF);
  return requestLine;
}

const server = net.createServer((socket) => {
  socket.on("close", () => {
    socket.end();
  });
  socket.on("data", (data) => {
    const httpRequest = data.toString();
    const requestLine = extractRequestLine(httpRequest);
    const [_method, path, _version] = requestLine.split(' ');
    console.log(requestLine);

    if (path === '/') {
      socket.write("HTTP/1.1 200 OK\r\n\r\n");
    } else {
      socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
    }

  });
});

server.listen(4221, "localhost");
