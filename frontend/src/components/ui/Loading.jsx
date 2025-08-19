import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

// 🔧 Loading simple en lugar de importar desde ui/
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

// Loading simple para páginas
export const PageLoading = ({ text = "Cargando página..." }) => (
  <LoadingSpinner text={text} fullScreen={true} />
);

// Loading para componentes
export const ComponentLoading = ({ text = "Cargando..." }) => (
  <LoadingSpinner text={text} size="h-6 w-6" />
);

// Loading para botones
export const ButtonLoading = () => (
  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
);


export default LoadingSpinner;