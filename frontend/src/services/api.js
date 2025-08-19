import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Base query con autenticación automática
const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
  prepareHeaders: (headers, { getState, endpoint }) => {
    const token = getState().auth.token;
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    
    // ✅ CRÍTICO: Solo establecer JSON para requests que NO son FormData
    // Si no establecemos content-type, el navegador lo hará automáticamente
    // Para FormData será: multipart/form-data; boundary=...
    // Para JSON será: application/json (si lo establecemos explícitamente)
    
    // NO establecer content-type aquí - deja que RTK Query y el navegador lo manejen
    // headers.set('content-type', 'application/json'); // ❌ REMOVER ESTA LÍNEA
    
    return headers;
  },
});

// Base query con manejo de errores y re-autenticación  
const baseQueryWithReauth = async (args, api, extraOptions) => {
  // ✅ AGREGAR: Establecer content-type solo para JSON
  if (args && typeof args === 'object' && args.body && !(args.body instanceof FormData)) {
    // Solo para requests con body que NO son FormData
    if (!args.headers) args.headers = {};
    args.headers['content-type'] = 'application/json';
  }
  
  let result = await baseQuery(args, api, extraOptions);
  
  if (result.error && result.error.status === 401) {
    // Token expirado, limpiar estado de auth
    api.dispatch({ type: 'auth/logout' });
  }
  
  return result;
};

// API base para todas las queries
export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'User', 
    'Auth', 
    'Category', 
    'Subcategory', 
    'Project', 
    'BlogPost', 
    'Subscriber',
    'ProjectMedia', // ✅ Agregar este tag type
    'FilterOptions' // ✅ Agregar este tag type
  ],
  endpoints: () => ({}),
});
