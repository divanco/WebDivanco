import { useAuth } from './useAuth';
import { useUI } from './useUI';
import { useCallback } from 'react';

/**
 * Master app hook that combines auth and UI functionality
 * Provides common patterns and utilities for the entire app
 */
export const useApp = () => {
  const auth = useAuth();
  const ui = useUI();

  // Common async operation handler
  const handleAsyncOperation = useCallback(async (
    operation,
    {
      loadingKey = 'global',
      successMessage,
      errorMessage = 'Ocurrió un error inesperado',
      showLoading = true,
      onSuccess,
      onError,
    } = {}
  ) => {
    try {
      if (showLoading) {
        ui.startLoading(loadingKey);
      }

      const result = await operation();

      if (successMessage) {
        ui.showSuccess(successMessage);
      }

      if (onSuccess) {
        onSuccess(result);
      }

      return result;
    } catch (error) {
      console.error('Async operation failed:', error);
      
      // Handle specific error types
      if (error.status === 401) {
        ui.showError('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.');
        auth.logout();
        return;
      }

      if (error.status === 403) {
        ui.showError('No tienes permisos para realizar esta acción.');
        return;
      }

      // Show custom error message or default
      const message = error.data?.message || errorMessage;
      ui.showError(message);

      if (onError) {
        onError(error);
      }

      throw error;
    } finally {
      if (showLoading) {
        ui.stopLoading(loadingKey);
      }
    }
  }, [ui, auth]);

  // Permission-based component renderer
  const renderIfAllowed = useCallback((requiredRole, component, fallback = null) => {
    if (auth.hasPermission(requiredRole)) {
      return component;
    }
    return fallback;
  }, [auth]);

  // Resource access checker
  const canAccessResource = useCallback((resource) => {
    return auth.canAccess(resource);
  }, [auth]);

  // Navigate with permission check
  const navigateIfAllowed = useCallback((resource, navigateFn) => {
    if (canAccessResource(resource)) {
      navigateFn();
    } else {
      ui.showError('No tienes permisos para acceder a esta sección.');
    }
  }, [canAccessResource, ui]);

  // Form submission handler with common patterns
  const handleFormSubmit = useCallback(async (
    submitFunction,
    {
      successMessage = 'Operación completada exitosamente',
      errorMessage = 'Error al procesar el formulario',
      resetForm,
      redirectTo,
    } = {}
  ) => {
    return handleAsyncOperation(submitFunction, {
      successMessage,
      errorMessage,
      onSuccess: (result) => {
        if (resetForm) {
          resetForm();
        }
        if (redirectTo) {
          redirectTo();
        }
      }
    });
  }, [handleAsyncOperation]);

  // API error handler with user-friendly messages
  const getErrorMessage = useCallback((error) => {
    if (error.status === 400) {
      return error.data?.message || 'Datos inválidos. Por favor, revisa la información ingresada.';
    }
    if (error.status === 404) {
      return 'El recurso solicitado no fue encontrado.';
    }
    if (error.status === 409) {
      return error.data?.message || 'Ya existe un registro con estos datos.';
    }
    if (error.status === 422) {
      return 'Los datos enviados no son válidos.';
    }
    if (error.status >= 500) {
      return 'Error interno del servidor. Por favor, intenta más tarde.';
    }
    return error.data?.message || 'Ocurrió un error inesperado.';
  }, []);

  return {
    // Auth functionality
    auth,
    
    // UI functionality
    ui,
    
    // Combined utilities
    handleAsyncOperation,
    renderIfAllowed,
    canAccessResource,
    navigateIfAllowed,
    handleFormSubmit,
    getErrorMessage,
    
    // Quick access to common patterns
    isAuthenticated: auth.isAuthenticated,
    isAdmin: auth.isAdmin,
    currentUser: auth.user,
    theme: ui.theme,
    isDarkMode: ui.isDarkMode,
    sidebarOpen: ui.sidebarOpen,
  };
};
