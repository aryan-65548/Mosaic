import multer from "multer";

export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof multer.MulterError) {
    const status = err.code === "LIMIT_FILE_SIZE" ? 413 : 400;
    return res.status(status).json({ error: err.message });
  }

  const status = err.statusCode ?? err.status ?? 500;
  const message = status < 500 ? err.message : "Internal server error";
  return res.status(status).json({ error: message });
}
