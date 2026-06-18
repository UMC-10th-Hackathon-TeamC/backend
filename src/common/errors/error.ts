import { ErrorRequestHandler } from "express";
import { ValidateError } from "tsoa";
import { AppError } from "./app.error";
import { errorResponse } from "../responses/response";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json(errorResponse(err.statusCode, err.message));
    return;
  }
  if (err instanceof ValidateError) {
    res.status(400).json(errorResponse(400, "요청 파라미터가 올바르지 않습니다."));
    return;
  }
  console.error(err);
  res.status(500).json(errorResponse(500, "서버 내부 오류가 발생했습니다."));
};
