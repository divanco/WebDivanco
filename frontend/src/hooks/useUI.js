import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useEffect } from 'react';
import { 
  selectTheme, 
  selectSidebarOpen, 
  selectLoading, 
  selectNotifications,
  toggleTheme,
  toggleSidebar,
  setSidebarOpen,
  setLoading,
  addNotification,
  removeNotification,
  clearNotifications
} from '../features/ui/uiSlice';

export const useUI = () => {
  const dispatch = useDispatch();
  const theme = useSelector(selectTheme);
  const sidebarOpen = useSelector(selectSidebarOpen);
  const loading = useSelector(selectLoading);
  const notifications = useSelector(selectNotifications);

  // Generate unique ID for notifications
  const generateId = useCallback(() => `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, []);

  // Enhanced notification system
  const showNotification = useCallback((notification) => {
    const id = notification.id || generateId();
    const notificationWithId = { 
      ...notification, 
      id,
      timestamp: Date.now()
    };
    
    dispatch(addNotification(notificationWithId));
    
    // Auto-remove after timeout (configurable per type)
    const timeout = notification.timeout !== undefined 
      ? notification.timeout 
      : notification.type === 'error' ? 8000 : 5000;
    
    if (timeout > 0) {
      setTimeout(() => {
        dispatch(removeNotification(id));
      }, timeout);
    }
    
    return id;
  }, [dispatch, generateId]);

  // Predefined notification types with consistent styling
  const showSuccess = useCallback((message, options = {}) => {
    return showNotification({ 
      type: 'success', 
      message,
      title: 'Éxito',
      ...options 
    });
  }, [showNotification]);

  const showError = useCallback((message, options = {}) => {
    return showNotification({ 
      type: 'error', 
      message,
      title: 'Error',
      timeout: 8000, // Errors stay longer
      ...options 
    });
  }, [showNotification]);

  const showInfo = useCallback((message, options = {}) => {
    return showNotification({ 
      type: 'info', 
      message,
      title: 'Información',
      ...options 
    });
  }, [showNotification]);

  const showWarning = useCallback((message, options = {}) => {
    return showNotification({ 
      type: 'warning', 
      message,
      title: 'Advertencia',
      timeout: 6000,
      ...options 
    });
  }, [showNotification]);

  const showLoading = useCallback((message = 'Cargando...', options = {}) => {
    return showNotification({ 
      type: 'loading', 
      message,
      title: 'Procesando',
      timeout: 0, // Loading notifications don't auto-dismiss
      ...options 
    });
  }, [showNotification]);

  // Loading state management
  const startLoading = useCallback((key = 'global') => {
    dispatch(setLoading({ [key]: true }));
  }, [dispatch]);

  const stopLoading = useCallback((key = 'global') => {
    dispatch(setLoading({ [key]: false }));
  }, [dispatch]);

  const isLoadingKey = useCallback((key = 'global') => {
    return Boolean(loading[key]);
  }, [loading]);

  // Enhanced sidebar management
  const openSidebar = useCallback(() => {
    dispatch(setSidebarOpen(true));
  }, [dispatch]);

  const closeSidebar = useCallback(() => {
    dispatch(setSidebarOpen(false));
  }, [dispatch]);

  const handleSidebarToggle = useCallback(() => {
    dispatch(toggleSidebar());
  }, [dispatch]);

  // Theme management with system preference detection
  const setTheme = useCallback((newTheme) => {
    if (newTheme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      dispatch(toggleTheme(systemTheme));
    } else {
      dispatch(toggleTheme(newTheme));
    }
  }, [dispatch]);

  const handleThemeToggle = useCallback(() => {
    dispatch(toggleTheme());
  }, [dispatch]);

  // Keyboard shortcuts support
  useEffect(() => {
    const handleKeyboard = (e) => {
      // Toggle sidebar with Ctrl/Cmd + B
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        handleSidebarToggle();
      }
      
      // Toggle theme with Ctrl/Cmd + Shift + T
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'T') {
        e.preventDefault();
        handleThemeToggle();
      }
    };

    window.addEventListener('keydown', handleKeyboard);
    return () => window.removeEventListener('keydown', handleKeyboard);
  }, [handleSidebarToggle, handleThemeToggle]);

  // Notification utilities
  const removeNotificationById = useCallback((id) => {
    dispatch(removeNotification(id));
  }, [dispatch]);

  const clearAllNotifications = useCallback(() => {
    dispatch(clearNotifications());
  }, [dispatch]);

  const getNotificationCount = useCallback((type) => {
    if (!type) return notifications.length;
    return notifications.filter(n => n.type === type).length;
  }, [notifications]);

  return {
    // State
    theme,
    sidebarOpen,
    loading,
    notifications,
    
    // Theme management
    setTheme,
    toggleTheme: handleThemeToggle,
    
    // Sidebar management
    openSidebar,
    closeSidebar,
    setSidebarOpen: (open) => dispatch(setSidebarOpen(open)),
    toggleSidebar: handleSidebarToggle,
    
    // Loading management
    startLoading,
    stopLoading,
    isLoading: isLoadingKey,
    setLoading: (loading) => dispatch(setLoading(loading)),
    
    // Notification system
    showNotification,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    showLoading,
    removeNotification: removeNotificationById,
    clearNotifications: clearAllNotifications,
    getNotificationCount,
    
    // Computed values
    isDarkMode: theme === 'dark',
    isLightMode: theme === 'light',
    hasNotifications: notifications.length > 0,
    hasErrors: notifications.some(n => n.type === 'error'),
  };
};
