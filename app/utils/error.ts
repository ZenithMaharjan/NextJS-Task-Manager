const statusErrorMap = new Map([
  [400, "Bad Request"],
  [401, "Unauthorized"],
  [402, "Payment Required"],
  [403, "Forbidden"],
  [404, "Not Found"],
  [405, "Method Not Allowed"],
  [406, "Not Acceptable"],
  [407, "Proxy Authentication Required"],
  [408, "Request Timeout"],
  [409, "Conflict"],
  [410, "Gone"],
  [411, "Length Required"],
  [412, "Precondition Failed"],
  [413, "Payload Too Large"],
  [414, "URI Too Long"],
  [415, "Unsupported Media Type"],
  [416, "Range Not Satisfiable"],
  [417, "Expectation Failed"],
  [500, "Internal Server Error"],
  [501, "Not Implemented"],
  [502, "Bad Gateway"],
  [503, "Service Unavailable"],
  [504, "Gateway Timeout"],
  [505, "HTTP Version Not Supported"],
]);

export class APIError extends Error {
  data: any;

  constructor(response: Response, data: any) {
    if (statusErrorMap.has(response.status)) {
      super(statusErrorMap.get(response.status));
    } else {
      super();
    }

    this.data = data;
    this.name = this.constructor.name;
  }

  toString() {
    let parsedError: any;
    const errorData = this.data;
    if (errorData?.message) {
      parsedError = errorData.message;
    } else if (errorData?.error) {
      parsedError = errorData.error;
    } else if (errorData?.detail) {
      parsedError = errorData.detail;
    } else if (errorData?.non_field_errors || errorData?.nonFieldErrors) {
      parsedError = errorData.non_field_errors?.[0] || errorData.nonFieldErrors?.[0];
    }
    if (typeof parsedError === "string") {
      return parsedError;
    }
    if (this.message) {
      return super.toString();
    }
    return "An error occured during API request!";
  }
}

export function getErrorMessage(
  error: string | Error | Record<string, unknown> | null | undefined,
): string | null {
  if (!error) return null;
  if (typeof error === "string") return error;
  if (error instanceof APIError) return error.toString();
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && "message" in error && typeof error.message === "string") {
    return error.message;
  }
  return "An unknown error occurred";
}
