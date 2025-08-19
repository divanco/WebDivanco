import { configureStore } from '@reduxjs/toolkit';
import { 
  persistStore, 
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import { combineReducers } from '@reduxjs/toolkit';

// APIs
import { baseApi } from './services/api';
import { authApi } from './features/auth/authApi';

import { usersApi } from './features/users/usersApi';

// Slices
import authReducer from './features/auth/authSlice';
import uiReducer from './features/ui/uiSlice';
import categoriesReducer from './features/categories/categoriesSlice'; // 🆕 Nuevo reducer
import projectsReducer from './features/projects/projectsSlice';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'], // Solo persistir auth
  blacklist: [
    baseApi.reducerPath,
    authApi.reducerPath,
    usersApi.reducerPath,
    'categories', // No persistir state de categories (se recarga desde API)
  ],
};

const rootReducer = combineReducers({
  auth: authReducer,
  ui: uiReducer,
  categories: categoriesReducer, 
  projects: projectsReducer,
  
  // APIs
  [baseApi.reducerPath]: baseApi.reducer,
  [authApi.reducerPath]: authApi.reducer,
  [usersApi.reducerPath]: usersApi.reducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    })
      .concat(baseApi.middleware)
      .concat(authApi.middleware)
      .concat(usersApi.middleware),
      
  devTools: process.env.NODE_ENV !== 'production',
});

export const persistor = persistStore(store);
// TypeScript type aliases removed because this is a JavaScript file.

export default store;