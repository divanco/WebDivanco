import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      console.log('🔐 Login exitoso:', action.payload);
      state.isLoading = false;
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.error = null;
      // Redux Persist se encarga de la persistencia, pero mantenemos localStorage como backup
      localStorage.setItem('token', action.payload.token);
      if (action.payload.user) {
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      }
    },
    loginFailure: (state, action) => {
      console.log('❌ Login falló:', action.payload);
      state.isLoading = false;
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.error = action.payload;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    logout: (state) => {
      console.log('🚪 Ejecutando logout en authSlice...');
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      console.log('✅ Estado de auth limpiado');
    },
    setUser: (state, action) => {
      state.user = action.payload;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
    clearError: (state) => {
      state.error = null;
    },
    // Nuevo: Para hidratar el estado desde localStorage si es necesario
    hydrate: (state) => {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      
      if (token && userStr) {
        try {
          state.token = token;
          state.user = JSON.parse(userStr);
          state.isAuthenticated = true;
          console.log('🔄 Estado hidratado desde localStorage');
        } catch (error) {
          console.error('Error al hidratar estado:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
  setUser,
  clearError,
  hydrate,
} = authSlice.actions;

// Selectors
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectToken = (state) => state.auth.token;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsLoading = (state) => state.auth.isLoading;
export const selectError = (state) => state.auth.error;

export default authSlice.reducer;