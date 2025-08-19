import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { logout as logoutAction } from '../features/auth/authSlice';
import { useLogoutUserMutation } from '../features/auth/authApi';
import { useAuth } from './useAuth';
import { useUI } from './useUI';

export const useAuthActions = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { showSuccess, showError } = useUI();
  const [logoutUser] = useLogoutUserMutation();
  
  // Obtener data de auth sin las acciones
  const authData = useAuth();

  const handleLogout = async () => {
    try {
      console.log('🚪 Iniciando logout...');
      
      // 1. Llamar al API para logout en el servidor
      try {
        await logoutUser().unwrap();
        console.log('✅ Logout del servidor exitoso');
        showSuccess('Sesión cerrada exitosamente');
      } catch (apiError) {
        console.warn('⚠️ Error en logout del servidor, continuando con logout local:', apiError);
        showError('Error al cerrar sesión en el servidor');
      }
      
      // 2. Hacer logout local (limpiar Redux y localStorage)
      dispatch(logoutAction());
      
      // 3. Navegar al login
      navigate('/auth/login', { replace: true });
      console.log('✅ Redirigido al login');
      
    } catch (error) {
      console.error('❌ Error en logout:', error);
      // En caso de error, hacer logout local de todas formas
      dispatch(logoutAction());
      showError('Error inesperado al cerrar sesión');
      navigate('/auth/login', { replace: true });
    }
  };

  const navigateIfAllowed = (path, resource = null) => {
    if (resource && !authData.canAccess(resource)) {
      showError('No tienes permisos para acceder a esta sección');
      return false;
    }
    navigate(path);
    return true;
  };

  const redirectToLoginWithReturn = () => {
    const currentPath = window.location.pathname;
    navigate('/auth/login', { 
      state: { from: currentPath },
      replace: true 
    });
  };

  return {
    ...authData,
    logout: handleLogout,
    navigateIfAllowed,
    redirectToLoginWithReturn,
  };
};