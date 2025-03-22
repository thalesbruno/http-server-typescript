import type { BunFile } from "bun";
import * as net from "net";
import { parseArgs } from "util";

const CRLF = "\r\n";
const DOUBLE_CRLF = "\r\n\r\n";

const StatusLineReason = {
  200: "OK",
  404: "Not Found",
  400: "Bad Request",
} as const;
type StatusCode = keyof typeof StatusLineReason;

const ContentTypes = {
  text: "text/plain",
  html: "text/html",
  json: "application/json",
  octet: "application/octet-stream",
};
type ContentType = keyof typeof ContentTypes;

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

const buildResponse = async (
  statusCode: StatusCode,
  type: ContentType = "text",
  body: string | BunFile = "",
): Promise<string> => {
  if (statusCode === 404) {
    return "HTTP/1.1 404 Not Found\r\n\r\n";
  }
  if (statusCode === 400) {
    return "HTTP/1.1 400 Bad Request\r\n\r\n";
  }

  const statusLine = `HTTP/1.1 ${statusCode} ${StatusLineReason[statusCode]}`;
  const headersMap = new Map<string, string>();

  headersMap.set("Content-Type", ContentTypes[type]);

  const bodyLength = typeof body === "string" ? body.length : body.size;
  headersMap.set("Content-Length", bodyLength.toString());

  const bodyResponse = typeof body === "string" ? body : await body.text();

  const headers = Array.from(headersMap.entries())
    .map(([key, value]) => `${key}: ${value}`)
    .join(CRLF);

  return `${statusLine}${CRLF}${headers}${DOUBLE_CRLF}${bodyResponse}`;
};

const getDirectory = () => {
  const { values } = parseArgs({
    args: Bun.argv,
    options: {
      directory: {
        type: "string",
      },
    },
    strict: true,
    allowPositionals: true,
  });

  return values["directory"];
};

const server = net.createServer((socket) => {
  socket.on("close", () => {
    socket.end();
  });
  socket.on("data", async (data) => {
    const {
      requestLine: { path },
      getHeader,
    } = parseRequest(data.toString());

    if (path.startsWith("/files/")) {
      const [_, fileName] = path.split("/files/");
      const directory = getDirectory();

      const file = Bun.file(`${directory}/${fileName}`);
      const exists = await file.exists();
      if (!exists) {
        const response = await buildResponse(404);
        socket.write(response);
        return;
      }

      const response = await buildResponse(200, 'octet', file);
      socket.write(response);
      return;
    }

    if (path === "/user-agent") {
      const userAgent = getHeader("User-Agent");
      if (!userAgent) {
        const response = await buildResponse(400);
        socket.write(response);
      } else {
        const response = await buildResponse(200, 'text', userAgent);
        socket.write(response);
      }
      return;
    }

    if (path.startsWith("/echo/")) {
      const [_, str] = path.split("/echo/");
      const response = await buildResponse(200, 'text', str);
      socket.write(response);
      return;
    }

    if (path === "/") {
      socket.write(await buildResponse(200));
      return;
    }

    socket.write(await buildResponse(404));
    return;
  });
});

server.listen(4221, "localhost");
