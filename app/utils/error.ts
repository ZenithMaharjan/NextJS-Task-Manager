export function getErrorMessage(error: any) {
  if (!error) return null;
  if (typeof error === "string") return error;
  if (error.message) return error.message;
  return "An unknown error occurred";
}
