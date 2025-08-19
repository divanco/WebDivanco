import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Lista de proyectos
  projects: [],
  
  // Proyecto individual
  currentProject: null,
  
  // Proyectos destacados
  featuredProjects: [],
  
  // ✅ NUEVO: Proyectos recientes
  recentProjects: [],
  
  // ✅ NUEVO: Proyectos por año
  projectsByYear: {
    year: null,
    projects: [],
    count: 0
  },
  
  // ✅ NUEVO: Años disponibles
  availableYears: [],
  
  // Opciones para filtros
  filterOptions: {
    years: [],
    locations: [],
    tags: [],
    project_types: [],
    etapas: [],
    sort_options: []
  },
  
  // Filtros aplicados actualmente
  currentFilters: {
    title: '',
    tags: [],
    location: '',
    search: '',
    year: null,
    projectType: null,
    etapa: null,
    client: '',
    architect: '',
    featured: false,
    sortBy: 'updatedAt',
    sortOrder: 'DESC'
  },
  
  // Paginación
  pagination: {
    current_page: 1,
    total_pages: 0,
    total_items: 0,
    items_per_page: 12
  },
  
  // Estados de carga
  isLoading: false,
  isLoadingProject: false,
  isLoadingFeatured: false,
  isLoadingRecent: false,        // ✅ NUEVO
  isLoadingByYear: false,        // ✅ NUEVO
  isLoadingYears: false,         // ✅ NUEVO
  isLoadingFilters: false,
  isUploading: false,
  isCreating: false,             // ✅ NUEVO
  isUpdating: false,             // ✅ NUEVO
  isDeleting: false,             // ✅ NUEVO
  
  // Errores
  error: null,
  uploadError: null,
  createError: null,             // ✅ NUEVO
  updateError: null,             // ✅ NUEVO
  deleteError: null,             // ✅ NUEVO
  
  // Cache para optimizar consultas
  cache: {},
  
  // Sugerencias de búsqueda
  suggestions: {
    titles: [],
    locations: [],
    tags: [],
    clients: [],
    architects: []
  }
};

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    // ✅ OBTENER PROYECTOS
    fetchProjectsStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchProjectsSuccess: (state, action) => {
      console.log('📂 Proyectos cargados:', action.payload.data?.length);
      state.isLoading = false;
      state.projects = action.payload.data || [];
      state.pagination = action.payload.pagination || state.pagination;
      state.error = null;
      
      // Actualizar filtros si están incluidos
      if (action.payload.filters) {
        state.currentFilters = { ...state.currentFilters, ...action.payload.filters.applied };
      }
    },
    fetchProjectsFailure: (state, action) => {
      console.log('❌ Error cargando proyectos:', action.payload);
      state.isLoading = false;
      state.error = action.payload;
      state.projects = [];
    },

    // ✅ OBTENER PROYECTO INDIVIDUAL
    fetchProjectStart: (state) => {
      state.isLoadingProject = true;
      state.error = null;
    },
    fetchProjectSuccess: (state, action) => {
      console.log('📋 Proyecto cargado:', action.payload.data?.title);
      state.isLoadingProject = false;
      state.currentProject = action.payload.data;
      state.error = null;
      
      // Agregar al cache
      if (action.payload.data?.slug) {
        state.cache[action.payload.data.slug] = action.payload.data;
      }
    },
    fetchProjectFailure: (state, action) => {
      console.log('❌ Error cargando proyecto:', action.payload);
      state.isLoadingProject = false;
      state.error = action.payload;
      state.currentProject = null;
    },

    // ✅ PROYECTOS DESTACADOS
    fetchFeaturedStart: (state) => {
      state.isLoadingFeatured = true;
      state.error = null;
    },
    fetchFeaturedSuccess: (state, action) => {
      console.log('⭐ Proyectos destacados cargados:', action.payload.data?.length);
      state.isLoadingFeatured = false;
      state.featuredProjects = action.payload.data || [];
      state.error = null;
    },
    fetchFeaturedFailure: (state, action) => {
      console.log('❌ Error cargando destacados:', action.payload);
      state.isLoadingFeatured = false;
      state.error = action.payload;
    },

    // ✅ NUEVO: PROYECTOS RECIENTES
    fetchRecentStart: (state) => {
      state.isLoadingRecent = true;
      state.error = null;
    },
    fetchRecentSuccess: (state, action) => {
      console.log('🕒 Proyectos recientes cargados:', action.payload.data?.length);
      state.isLoadingRecent = false;
      state.recentProjects = action.payload.data || [];
      state.error = null;
    },
    fetchRecentFailure: (state, action) => {
      console.log('❌ Error cargando recientes:', action.payload);
      state.isLoadingRecent = false;
      state.error = action.payload;
    },

    // ✅ NUEVO: PROYECTOS POR AÑO
    fetchProjectsByYearStart: (state) => {
      state.isLoadingByYear = true;
      state.error = null;
    },
    fetchProjectsByYearSuccess: (state, action) => {
      console.log('📅 Proyectos por año cargados:', action.payload.data?.count);
      state.isLoadingByYear = false;
      state.projectsByYear = {
        year: action.payload.data?.year || null,
        projects: action.payload.data?.projects || [],
        count: action.payload.data?.count || 0
      };
      state.error = null;
    },
    fetchProjectsByYearFailure: (state, action) => {
      console.log('❌ Error cargando proyectos por año:', action.payload);
      state.isLoadingByYear = false;
      state.error = action.payload;
    },

    // ✅ NUEVO: AÑOS DISPONIBLES
    fetchAvailableYearsStart: (state) => {
      state.isLoadingYears = true;
      state.error = null;
    },
    fetchAvailableYearsSuccess: (state, action) => {
      console.log('📊 Años disponibles cargados:', action.payload.data?.length);
      state.isLoadingYears = false;
      state.availableYears = action.payload.data || [];
      state.error = null;
    },
    fetchAvailableYearsFailure: (state, action) => {
      console.log('❌ Error cargando años:', action.payload);
      state.isLoadingYears = false;
      state.error = action.payload;
    },

    // ✅ OPCIONES DE FILTROS
    fetchFilterOptionsStart: (state) => {
      state.isLoadingFilters = true;
    },
    fetchFilterOptionsSuccess: (state, action) => {
      console.log('🎛️ Opciones de filtro cargadas');
      state.isLoadingFilters = false;
      state.filterOptions = action.payload.data || state.filterOptions;
    },
    fetchFilterOptionsFailure: (state, action) => {
      console.log('❌ Error cargando opciones de filtro:', action.payload);
      state.isLoadingFilters = false;
      state.error = action.payload;
    },

    // ✅ SUGERENCIAS DE BÚSQUEDA
    setSuggestions: (state, action) => {
      state.suggestions = action.payload.data || state.suggestions;
    },
    clearSuggestions: (state) => {
      state.suggestions = {
        titles: [],
        locations: [],
        tags: [],
        clients: [],
        architects: []
      };
    },

    // ✅ NUEVO: CREAR PROYECTO
    createProjectStart: (state) => {
      state.isCreating = true;
      state.createError = null;
    },
    createProjectSuccess: (state, action) => {
      console.log('➕ Proyecto creado:', action.payload.data?.title);
      state.isCreating = false;
      state.createError = null;
      
      // Agregar al inicio de la lista si existe
      if (action.payload.data) {
        state.projects.unshift(action.payload.data);
        // Actualizar contador
        state.pagination.total_items += 1;
      }
    },
    createProjectFailure: (state, action) => {
      console.log('❌ Error creando proyecto:', action.payload);
      state.isCreating = false;
      state.createError = action.payload;
    },

    // ✅ NUEVO: ACTUALIZAR PROYECTO
    updateProjectStart: (state) => {
      state.isUpdating = true;
      state.updateError = null;
    },
    updateProjectSuccess: (state, action) => {
      console.log('✏️ Proyecto actualizado:', action.payload.data?.title);
      state.isUpdating = false;
      state.updateError = null;
      
      const updatedProject = action.payload.data;
      if (updatedProject) {
        // Actualizar en proyecto actual
        if (state.currentProject?.id === updatedProject.id) {
          state.currentProject = updatedProject;
        }
        
        // Actualizar en lista
        const index = state.projects.findIndex(p => p.id === updatedProject.id);
        if (index !== -1) {
          state.projects[index] = updatedProject;
        }
        
        // Actualizar en cache
        if (updatedProject.slug) {
          state.cache[updatedProject.slug] = updatedProject;
        }
      }
    },
    updateProjectFailure: (state, action) => {
      console.log('❌ Error actualizando proyecto:', action.payload);
      state.isUpdating = false;
      state.updateError = action.payload;
    },

    // ✅ NUEVO: ELIMINAR PROYECTO
    deleteProjectStart: (state) => {
      state.isDeleting = true;
      state.deleteError = null;
    },
    deleteProjectSuccess: (state, action) => {
      console.log('🗑️ Proyecto eliminado:', action.payload.projectId);
      state.isDeleting = false;
      state.deleteError = null;
      
      const projectId = action.payload.projectId;
      
      // Remover de la lista
      state.projects = state.projects.filter(p => p.id !== projectId);
      
      // Remover de destacados si está ahí
      state.featuredProjects = state.featuredProjects.filter(p => p.id !== projectId);
      
      // Remover de recientes si está ahí
      state.recentProjects = state.recentProjects.filter(p => p.id !== projectId);
      
      // Si es el proyecto actual, limpiarlo
      if (state.currentProject?.id === projectId) {
        state.currentProject = null;
      }
      
      // Actualizar contador
      state.pagination.total_items = Math.max(0, state.pagination.total_items - 1);
    },
    deleteProjectFailure: (state, action) => {
      console.log('❌ Error eliminando proyecto:', action.payload);
      state.isDeleting = false;
      state.deleteError = action.payload;
    },

    // ✅ MANEJO DE FILTROS
    setFilters: (state, action) => {
      console.log('🎛️ Filtros actualizados:', action.payload);
      state.currentFilters = { ...state.currentFilters, ...action.payload };
      // Resetear paginación al cambiar filtros
      state.pagination.current_page = 1;
    },
    clearFilters: (state) => {
      console.log('🧹 Filtros limpiados');
      state.currentFilters = {
        title: '',
        tags: [],
        location: '',
        search: '',
        year: null,
        projectType: null,
        etapa: null,
        client: '',
        architect: '',
        featured: false,
        sortBy: 'updatedAt',
        sortOrder: 'DESC'
      };
      state.pagination.current_page = 1;
    },
    setPage: (state, action) => {
      state.pagination.current_page = action.payload;
    },

    // ✅ SUBIR ARCHIVOS MULTIMEDIA
    uploadMediaStart: (state) => {
      state.isUploading = true;
      state.uploadError = null;
    },
    uploadMediaSuccess: (state, action) => {
      console.log('📤 Archivo subido exitosamente:', action.payload.data?.type);
      state.isUploading = false;
      state.uploadError = null;
      
      // Si hay un proyecto actual, actualizar sus media
      if (state.currentProject && action.payload.data) {
        if (!state.currentProject.media) {
          state.currentProject.media = [];
        }
        state.currentProject.media.push(action.payload.data);
        
        // Si el archivo se marcó como principal, actualizar los demás
        if (action.payload.data.isMain) {
          state.currentProject.media.forEach(media => {
            if (media.id !== action.payload.data.id) {
              media.isMain = false;
            }
          });
        }
      }
    },
    uploadMediaFailure: (state, action) => {
      console.log('❌ Error subiendo archivo:', action.payload);
      state.isUploading = false;
      state.uploadError = action.payload;
    },

    // ✅ GESTIÓN DE CACHE
    updateCache: (state, action) => {
      const { slug, project } = action.payload;
      if (slug && project) {
        state.cache[slug] = project;
      }
    },
    clearCache: (state) => {
      console.log('🧹 Cache de proyectos limpiado');
      state.cache = {};
    },

    // ✅ GESTIÓN DE ERRORES
    clearError: (state) => {
      state.error = null;
    },
    clearUploadError: (state) => {
      state.uploadError = null;
    },
    clearCreateError: (state) => {
      state.createError = null;
    },
    clearUpdateError: (state) => {
      state.updateError = null;
    },
    clearDeleteError: (state) => {
      state.deleteError = null;
    },
    clearAllErrors: (state) => {
      state.error = null;
      state.uploadError = null;
      state.createError = null;
      state.updateError = null;
      state.deleteError = null;
    },

    // ✅ RESET COMPLETO
    resetProjects: (state) => {
      console.log('🔄 Estado de proyectos reseteado');
      return { ...initialState };
    },

    // ✅ OPTIMIZACIÓN: Cargar proyecto desde cache
    loadProjectFromCache: (state, action) => {
      const { slug } = action.payload;
      if (state.cache[slug]) {
        console.log('⚡ Proyecto cargado desde cache:', slug);
        state.currentProject = state.cache[slug];
        state.isLoadingProject = false;
        state.error = null;
      }
    },

    // ✅ ACTUALIZAR VISTA DE PROYECTO (incrementar viewCount)
    incrementProjectViews: (state, action) => {
      const { slug } = action.payload;
      
      // Actualizar en proyecto actual
      if (state.currentProject?.slug === slug) {
        state.currentProject.viewCount = (state.currentProject.viewCount || 0) + 1;
      }
      
      // Actualizar en lista de proyectos
      const projectIndex = state.projects.findIndex(p => p.slug === slug);
      if (projectIndex !== -1) {
        state.projects[projectIndex].viewCount = (state.projects[projectIndex].viewCount || 0) + 1;
      }
      
      // Actualizar en cache
      if (state.cache[slug]) {
        state.cache[slug].viewCount = (state.cache[slug].viewCount || 0) + 1;
      }
    }
  },
});

export const {
  // Proyectos generales
  fetchProjectsStart,
  fetchProjectsSuccess,
  fetchProjectsFailure,
  
  // Proyecto individual
  fetchProjectStart,
  fetchProjectSuccess,
  fetchProjectFailure,
  
  // Destacados
  fetchFeaturedStart,
  fetchFeaturedSuccess,
  fetchFeaturedFailure,
  
  // ✅ NUEVOS: Recientes
  fetchRecentStart,
  fetchRecentSuccess,
  fetchRecentFailure,
  
  // ✅ NUEVOS: Por año
  fetchProjectsByYearStart,
  fetchProjectsByYearSuccess,
  fetchProjectsByYearFailure,
  
  // ✅ NUEVOS: Años disponibles
  fetchAvailableYearsStart,
  fetchAvailableYearsSuccess,
  fetchAvailableYearsFailure,
  
  // Filtros
  fetchFilterOptionsStart,
  fetchFilterOptionsSuccess,
  fetchFilterOptionsFailure,
  setFilters,
  clearFilters,
  setPage,
  
  // Sugerencias
  setSuggestions,
  clearSuggestions,
  
  // ✅ NUEVOS: CRUD
  createProjectStart,
  createProjectSuccess,
  createProjectFailure,
  updateProjectStart,
  updateProjectSuccess,
  updateProjectFailure,
  deleteProjectStart,
  deleteProjectSuccess,
  deleteProjectFailure,
  
  // Upload
  uploadMediaStart,
  uploadMediaSuccess,
  uploadMediaFailure,
  
  // Cache
  updateCache,
  clearCache,
  loadProjectFromCache,
  
  // Errores
  clearError,
  clearUploadError,
  clearCreateError,
  clearUpdateError,
  clearDeleteError,
  clearAllErrors,
  
  // Utilidades
  resetProjects,
  incrementProjectViews
} = projectsSlice.actions;

// ✅ SELECTORS (actualizados con las nuevas funcionalidades)
export const selectProjects = (state) => state.projects;
export const selectProjectsList = (state) => state.projects.projects;
export const selectCurrentProject = (state) => state.projects.currentProject;
export const selectFeaturedProjects = (state) => state.projects.featuredProjects;
export const selectRecentProjects = (state) => state.projects.recentProjects; // ✅ NUEVO
export const selectProjectsByYear = (state) => state.projects.projectsByYear; // ✅ NUEVO
export const selectAvailableYears = (state) => state.projects.availableYears; // ✅ NUEVO
export const selectFilterOptions = (state) => state.projects.filterOptions;
export const selectCurrentFilters = (state) => state.projects.currentFilters;
export const selectPagination = (state) => state.projects.pagination;
export const selectSuggestions = (state) => state.projects.suggestions;

// Estados de carga
export const selectIsLoading = (state) => state.projects.isLoading;
export const selectIsLoadingProject = (state) => state.projects.isLoadingProject;
export const selectIsLoadingFeatured = (state) => state.projects.isLoadingFeatured;
export const selectIsLoadingRecent = (state) => state.projects.isLoadingRecent; // ✅ NUEVO
export const selectIsLoadingByYear = (state) => state.projects.isLoadingByYear; // ✅ NUEVO
export const selectIsLoadingYears = (state) => state.projects.isLoadingYears; // ✅ NUEVO
export const selectIsLoadingFilters = (state) => state.projects.isLoadingFilters;
export const selectIsUploading = (state) => state.projects.isUploading;
export const selectIsCreating = (state) => state.projects.isCreating; // ✅ NUEVO
export const selectIsUpdating = (state) => state.projects.isUpdating; // ✅ NUEVO
export const selectIsDeleting = (state) => state.projects.isDeleting; // ✅ NUEVO

// Errores
export const selectError = (state) => state.projects.error;
export const selectUploadError = (state) => state.projects.uploadError;
export const selectCreateError = (state) => state.projects.createError; // ✅ NUEVO
export const selectUpdateError = (state) => state.projects.updateError; // ✅ NUEVO
export const selectDeleteError = (state) => state.projects.deleteError; // ✅ NUEVO

// Selectores computed (para datos derivados)
export const selectHasProjects = (state) => state.projects.projects.length > 0;
export const selectHasFeatured = (state) => state.projects.featuredProjects.length > 0;
export const selectHasRecent = (state) => state.projects.recentProjects.length > 0; // ✅ NUEVO
export const selectActiveFiltersCount = (state) => {
  const filters = state.projects.currentFilters;
  return Object.entries(filters).filter(([key, value]) => {
    if (key === 'sortBy' || key === 'sortOrder') return false;
    if (Array.isArray(value)) return value.length > 0;
    return value && value !== '';
  }).length;
};

// Selector para proyecto en cache
export const selectProjectFromCache = (slug) => (state) => state.projects.cache[slug];

// ✅ NUEVO: Selector para verificar si hay operaciones en curso
export const selectIsAnyLoading = (state) => {
  return state.projects.isLoading ||
         state.projects.isLoadingProject ||
         state.projects.isLoadingFeatured ||
         state.projects.isLoadingRecent ||
         state.projects.isLoadingByYear ||
         state.projects.isLoadingYears ||
         state.projects.isLoadingFilters ||
         state.projects.isUploading ||
         state.projects.isCreating ||
         state.projects.isUpdating ||
         state.projects.isDeleting;
};

// ✅ NUEVO: Selector para verificar si hay errores
export const selectHasErrors = (state) => {
  return !!(state.projects.error ||
           state.projects.uploadError ||
           state.projects.createError ||
           state.projects.updateError ||
           state.projects.deleteError);
};

export default projectsSlice.reducer;