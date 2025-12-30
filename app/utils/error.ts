export function getErrorMessage(error: string | Error | Record<string, unknown> | null | undefined): string | null {
  if (!error) return null;
  if (typeof error === "string") return error;
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && "message" in error && typeof error.message === "string") {
    return error.message;
  }
  return "An unknown error occurred";
}
