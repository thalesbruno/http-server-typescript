import * as net from "net";

const CRLF = "\r\n";
const DOUBLE_CRLF = "\r\n\r\n";

const parseRequest = (httpRequest: string) => {
  const [_requestLine, ...headersAndBody] = httpRequest.split(CRLF);
  const [method, path, version] = _requestLine.split(" ");
  const requestLine = { method, path, version };
  const [headers, body] = headersAndBody.join("").split(DOUBLE_CRLF);
  return { requestLine, headers, body };
};

const StatusLineReason = {
  200: "OK",
  404: "Not Found",
} as const;
type StatusCode = keyof typeof StatusLineReason;

const buildResponse = (statusCode: StatusCode, body: string): string => {
  const statusLine = `HTTP/1.1 ${statusCode} ${StatusLineReason[statusCode]}`;

  const headers = new Map<string, string>();
  headers.set("Content-Type", "text/plain");
  headers.set("Content-Length", body.length.toString());
  const headersString = Array.from(headers.entries())
    .map(([key, value]) => `${key}: ${value}`)
    .join(CRLF);

  return `${statusLine}${CRLF}${headersString}${DOUBLE_CRLF}${body}`;
};

const server = net.createServer((socket) => {
  socket.on("close", () => {
    socket.end();
  });
  socket.on("data", (data) => {
    const {
      requestLine: { path },
    } = parseRequest(data.toString());

    if (path.startsWith("/echo/")) {
      const [_, str] = path.split("/echo/");
      const response = buildResponse(200, str);
      socket.write(response);
    }
    if (path === "/") {
      socket.write("HTTP/1.1 200 OK\r\n\r\n");
    } else {
      socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
    }
  });
});

server.listen(4221, "localhost");
