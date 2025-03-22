import * as net from "net";

const CRLF = "\r\n";
const DOUBLE_CRLF = "\r\n\r\n";

const parseRequest = (httpRequest: string) => {
  const [requestLineAndHeaders, ...body] = httpRequest.split(DOUBLE_CRLF);
  const [_requestLine, ...headers] = requestLineAndHeaders.split(CRLF);
  const [method, path, version] = _requestLine.split(" ");
  const requestLine = { method, path, version };

  const headersMap = new Map<string, string>();
  headers.forEach((header) => {
    const [key, value] = header.split(": ");
    headersMap.set(key, value);
  });
  const getHeader = (key: string) => headersMap.get(key);

  return { requestLine, headers, getHeader, body };
};

const StatusLineReason = {
  200: "OK",
  404: "Not Found",
  400: "Bad Request",
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
      getHeader,
    } = parseRequest(data.toString());

    if (path === "/user-agent") {
      const userAgent = getHeader("User-Agent");
      if (!userAgent) {
        const response = buildResponse(400, "Bad Request");
        socket.write(response);
      } else {
        const response = buildResponse(200, userAgent);
        socket.write(response);
      }
      return;
    }

    if (path.startsWith("/echo/")) {
      const [_, str] = path.split("/echo/");
      const response = buildResponse(200, str);
      socket.write(response);
      return;
    }

    if (path === "/") {
      socket.write("HTTP/1.1 200 OK\r\n\r\n");
      return;
    }

    socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
    return;
  });
});

server.listen(4221, "localhost");
