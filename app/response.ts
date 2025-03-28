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
): Promise<string | ArrayBuffer> => {
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

  let finalBody: string | Uint8Array = bodyResponse;
  
  if (options?.encoding) {
    const { compressed, size } = await compress(bodyResponse);
    finalBody = new Uint8Array(await compressed.arrayBuffer());
    headersMap.set("Content-Length", size.toString());
  }

  const headers = Array.from(headersMap.entries())
    .map(([key, value]) => `${key}: ${value}`)
    .join(CRLF);

  const responseHeader = `${statusLine}${CRLF}${headers}${DOUBLE_CRLF}`;
  
  if (finalBody instanceof Uint8Array) {
    const headerBuffer = new TextEncoder().encode(responseHeader);
    const combinedBuffer = new Uint8Array(headerBuffer.length + finalBody.length);
    combinedBuffer.set(headerBuffer);
    combinedBuffer.set(finalBody, headerBuffer.length);
    return combinedBuffer.buffer;
  }

  return `${responseHeader}${finalBody}`;
};
