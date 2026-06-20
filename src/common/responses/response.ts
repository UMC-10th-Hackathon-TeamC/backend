export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T | null;
}

export function successResponse<T>(statusCode: number, message: string, data: T): ApiResponse<T> {
  return { success: true, statusCode, message, data };
}

export function errorResponse(statusCode: number, message: string): ApiResponse<null> {
  return { success: false, statusCode, message, data: null };
}
