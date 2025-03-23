import type { BunFile } from "bun";
import {
  StatusCode,
  StatusCodeReason,
  type ResponseOptions,
  type StatusCodeType,
} from "./types";
import { CRLF, DOUBLE_CRLF } from "./constants";
import { compress } from "./compression";

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

  headersMap.set("Content-Type", options?.contentType ?? "text/plain");

  const bodyLength = typeof body === "string" ? body.length : body.size;
  headersMap.set("Content-Length", bodyLength.toString());

  if (options?.encoding) {
    headersMap.set("Content-Encoding", options.encoding);
  }

  const bodyResponse = typeof body === "string" ? body : await body.text();

  let bodyCompressed: Buffer | undefined;
  if (options?.encoding) {
    const { compressed, size } = await compress(bodyResponse);
    bodyCompressed = compressed;
    headersMap.set("Content-Length", size.toString());
  }

  const headers = Array.from(headersMap.entries())
    .map(([key, value]) => `${key}: ${value}`)
    .join(CRLF);

  if (bodyCompressed) {
    const responseHeader = `${statusLine}${CRLF}${headers}${DOUBLE_CRLF}`;
    const responseBuffer = new TextEncoder().encode(responseHeader);
    const finalResponse = new Uint8Array(responseBuffer.length + bodyCompressed.length);
    finalResponse.set(responseBuffer, 0);
    finalResponse.set(bodyCompressed, responseBuffer.length);
    return Buffer.from(finalResponse).toString();
  }
  
  return `${statusLine}${CRLF}${headers}${DOUBLE_CRLF}${bodyResponse}`;
};
