import { ApiResponse } from "../utils/ApiResponse.js";

export const errorHandler = (err, req, res, next) => {
  console.log("🔥 Error: ", err);
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    return res.status(400).json({
      status: 400,
      message: `${field} already exists`,
    });
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  return res
    .status(statusCode)
    .json(new ApiResponse(statusCode, message, null, false));
};
