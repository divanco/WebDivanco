import { useState } from 'react';
import { useLogoutUserMutation } from '../../features/auth/authApi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const LogoutButton = ({ 
  variant = 'primary', // 'primary', 'secondary', 'danger'
  size = 'md', // 'sm', 'md', 'lg'
  className = '',
  children,
  showConfirm = false,
  redirectTo = '/',
  ...props 
}) => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutUser] = useLogoutUserMutation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleLogout = async () => {
    // Mostrar confirmación si está habilitada
    if (showConfirm) {
      const confirmed = window.confirm('¿Estás seguro de que quieres cerrar sesión?');
      if (!confirmed) return;
    }

    try {
      setIsLoggingOut(true);
      console.log('🚪 Iniciando logout...');
      
      // Ejecutar logout a través de la API
      await logoutUser().unwrap();
      
      // Limpiar localStorage como respaldo
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      console.log('✅ Logout exitoso');
      
      // Redirigir después del logout
      navigate(redirectTo, { replace: true });
      
    } catch (error) {
      console.error('❌ Error durante logout:', error);
      
      // En caso de error, forzar limpieza y redirección
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = redirectTo;
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Estilos según la variante
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-600 hover:bg-blue-700 text-white border-transparent';
      case 'secondary':
        return 'bg-gray-600 hover:bg-gray-700 text-white border-transparent';
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white border-transparent';
      case 'outline':
        return 'bg-transparent hover:bg-gray-50 text-gray-700 border-gray-300';
      default:
        return 'bg-blue-600 hover:bg-blue-700 text-white border-transparent';
    }
  };

  // Estilos según el tamaño
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1 text-sm';
      case 'md':
        return 'px-4 py-2 text-sm';
      case 'lg':
        return 'px-6 py-3 text-base';
      default:
        return 'px-4 py-2 text-sm';
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={isLoggingOut}
      className={`
        inline-flex items-center justify-center
        border font-medium rounded-md
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        transition-colors duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${getVariantStyles()}
        ${getSizeStyles()}
        ${className}
      `}
      title={`Cerrar sesión${user?.name ? ` (${user.name})` : ''}`}
      {...props}
    >
      {isLoggingOut ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Cerrando sesión...
        </>
      ) : (
        <>
          {children || (
            <>
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Cerrar Sesión
            </>
          )}
        </>
      )}
    </button>
  );
};

// Componente simple de icono para casos específicos
export const LogoutIcon = ({ className = "h-4 w-4", ...props }) => (
  <svg 
    className={className} 
    fill="none" 
    stroke="currentColor" 
    viewBox="0 0 24 24"
    {...props}
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" 
    />
  </svg>
);

export default LogoutButton;
