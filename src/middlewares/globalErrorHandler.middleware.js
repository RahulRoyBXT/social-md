import { ApiError } from "../utils/ApiError.js";

export const globalErrorHandler = (err, req, res, next) => {
  console.error("Error: ", err);

  // Default values
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let errors = err.errors || [];
  let data = err.data || null;
  let success = false;

  // Handle unexpected errors
  if (!(err instanceof ApiError)) {
    message = "Something went wrong!";
  }

  res.status(statusCode).json({
    success,
    message,
    errors,
    data,
  });
};
