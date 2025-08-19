// Utilidad para respuestas uniformes en controllers

export function successResponse(res, data, message = 'OK', status = 200) {
  return res.status(status).json({
    success: true,
    message,
    data,
  });
}

export function errorResponse(res, error, message = 'Error', status = 500) {
  return res.status(status).json({
    success: false,
    message,
    error: typeof error === 'string' ? error : error.message,
  });
}
