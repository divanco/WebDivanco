// Public Layout
export { default as PublicLayout } from './public/PublicLayout';
export { default as Header } from './public/Header';
export { default as Footer } from './public/Footer';

// Admin Layout
export { default as AdminLayout } from './admin/AdminLayout';
export { default as AdminHeader } from './admin/AdminHeader';
export { default as AdminSidebar } from './admin/AdminSidebar';

// Auth Layout
export { default as AuthLayout } from './auth/AuthLayout';

// Shared
export { default as ProtectedRoute } from './shared/ProtectedRoute';
export { default as ScrollToTop } from './shared/ScrollToTop'; // ✅ Corregido: ScrollToTop no ScrollTop
export { default as LoadingBoundary, LoadingSpinner } from './shared/LoadingBoundary';