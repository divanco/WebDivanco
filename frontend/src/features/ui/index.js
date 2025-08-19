// Exports centralizados del feature UI

// Slice
export * from './uiSlice';

// Re-exportar acciones más usadas
export {
  toggleTheme,
  setTheme,
  toggleSidebar,
  setSidebarOpen,
  setLoading,
  addNotification,
  removeNotification,
  clearNotifications,
} from './uiSlice';

// Re-exportar selectores más usados
export {
  selectTheme,
  selectSidebarOpen,
  selectLoading,
  selectNotifications,
} from './uiSlice';

// Reducer default export
export { default as uiReducer } from './uiSlice';