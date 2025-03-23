import { CRLF, DOUBLE_CRLF } from "./constants";

export const parseRequest = (httpRequest: string) => {
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
