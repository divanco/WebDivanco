// Middleware de manejo centralizado de errores
export default function errorHandler(err, req, res, next) {
  // Loguea el error en consola (solo en desarrollo)
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', err);
  }

  // Respuesta uniforme
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err : undefined,
  });
}
