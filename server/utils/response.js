export function success(res, data = {}, message = "Success", status = 200) {
  return res.status(status).json({
    success: true,
    message,
    timestamp: new Date().toISOString(),
    data,
  });
}

export function failure(res, message = "Internal Server Error", status = 500, details = null) {
  return res.status(status).json({
    success: false,
    message,
    timestamp: new Date().toISOString(),
    details,
  });
}