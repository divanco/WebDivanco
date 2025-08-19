import { Suspense } from 'react';

// Loading Spinner compartido
export const LoadingSpinner = ({ 
  text = "Cargando...", 
  size = "h-8 w-8",
  fullScreen = false 
}) => (
  <div className={`flex items-center justify-center ${fullScreen ? 'min-h-screen bg-gray-50' : 'min-h-[200px]'}`}>
    <div className="text-center">
      <div className={`animate-spin rounded-full ${size} border-b-2 border-primary-600 mx-auto ${text ? 'mb-4' : ''}`}></div>
      {text && (
        <p className="text-gray-600 text-sm font-medium">{text}</p>
      )}
    </div>
  </div>
);

// Loading Boundary para Suspense
const LoadingBoundary = ({ children, fallback }) => {
  const defaultFallback = <LoadingSpinner />;
  
  return (
    <Suspense fallback={fallback || defaultFallback}>
      {children}
    </Suspense>
  );
};

export default LoadingBoundary;