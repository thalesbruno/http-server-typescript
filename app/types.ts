type KeyOf<T> = T[keyof T];

export const HttpMethod = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT", 
  DELETE: "DELETE",
  PATCH: "PATCH",
  OPTIONS: "OPTIONS",
} as const;
export type HttpMethodType = KeyOf<typeof HttpMethod>;

export const StatusCode = {
  "OK": 200,
  "CREATED": 201,
  "BAD_REQUEST": 400,
  "NOT_FOUND": 404,
} as const;
export type StatusCodeType = KeyOf<typeof StatusCode>;

export const StatusCodeReason = {
  200: "OK",
  201: "Created",
  400: "Bad Request",
  404: "Not Found",
} as const;
export type StatusCodeReasonType = KeyOf<typeof StatusCodeReason>;

export const ContentType = {
  text: "text/plain",
  html: "text/html",
  json: "application/json",
  octet: "application/octet-stream",
} as const;
export type ContentTypeType = KeyOf<typeof ContentType>;
