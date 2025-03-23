import type { BunFile } from "bun";
import {
  StatusCode,
  StatusCodeReason,
  type ContentTypeType,
  type StatusCodeType,
} from "./types";
import { CRLF, DOUBLE_CRLF } from "./constants";

export const buildResponse = async (
  statusCode: StatusCodeType,
  type: ContentTypeType = "text/plain",
  body: string | BunFile = "",
  encoding?: string,
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

  headersMap.set("Content-Type", type);

  const bodyLength = typeof body === "string" ? body.length : body.size;
  headersMap.set("Content-Length", bodyLength.toString());

  if (encoding) {
    headersMap.set("Content-Encoding", encoding);
  }

  const bodyResponse = typeof body === "string" ? body : await body.text();

  const headers = Array.from(headersMap.entries())
    .map(([key, value]) => `${key}: ${value}`)
    .join(CRLF);

  return `${statusLine}${CRLF}${headers}${DOUBLE_CRLF}${bodyResponse}`;
};
