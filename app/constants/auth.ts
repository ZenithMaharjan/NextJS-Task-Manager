export type StatusType = "success" | "warning" | "error";

export const STATUS_COLORS: Record<StatusType, string> = {
  success: "#00af54",
  warning: "#fbaf00",
  error: "#d64933",
};

export type _ApiError = {
  message: string;
  status: number;
};
