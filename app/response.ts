import type { BunFile } from "bun";
import {
  StatusCode,
  StatusCodeReason,
  type ResponseOptions,
  type StatusCodeType,
} from "./types";
import { CRLF, DOUBLE_CRLF } from "./constants";

export const buildResponse = async (
  statusCode: StatusCodeType,
  body: string | BunFile = "",
  options?: ResponseOptions,
): Promise<string> => {
  if (statusCode === StatusCode.NOT_FOUND) {
    return `HTTP/1.1 404 Not Found${DOUBLE_CRLF}`;
  }
  if (statusCode === StatusCode.BAD_REQUEST) {
    return `HTTP/1.1 400 Bad Request${DOUBLE_CRLF}`;
  }
  if (statusCode === StatusCode.CREATED) {
    return `HTTP/1.1 201 Created${DOUBLE_CRLF}`;
  }

  const statusLine = `HTTP/1.1 ${statusCode} ${StatusCodeReason[statusCode]}`;
  const headersMap = new Map<string, string>();

  headersMap.set("Content-Type", options?.contentType ?? 'text/plain');

  const bodyLength = typeof body === "string" ? body.length : body.size;
  headersMap.set("Content-Length", bodyLength.toString());

  if (options?.encoding) {
    headersMap.set("Content-Encoding", options.encoding);
  }

  const bodyResponse = typeof body === "string" ? body : await body.text();

  const headers = Array.from(headersMap.entries())
    .map(([key, value]) => `${key}: ${value}`)
    .join(CRLF);

  return `${statusLine}${CRLF}${headers}${DOUBLE_CRLF}${bodyResponse}`;
};
