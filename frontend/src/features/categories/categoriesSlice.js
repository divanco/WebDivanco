import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Estado local para filtros y UI
  filters: {
    search: '',
    active: true,
    featured: null,
    sortBy: 'order', // order, name, created_at
    sortOrder: 'asc', // asc, desc
  },
  
  // Vista actual (grid, list)
  viewMode: localStorage.getItem('categories-view-mode') || 'grid',
  
  // Paginación local
  pagination: {
    currentPage: 1,
    itemsPerPage: 12,
  },
  
  // Estados de UI específicos de categories
  ui: {
    showFilters: false,
    selectedCategory: null,
    isDetailModalOpen: false,
    isCreateModalOpen: false,
    isEditModalOpen: false,
  },
  
  // Cache local para datos computados
  computed: {
    filteredCount: 0,
    totalPages: 0,
  },
};

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {
    // Filtros
    setSearchFilter: (state, action) => {
      state.filters.search = action.payload;
      state.pagination.currentPage = 1; // Reset página al filtrar
    },
    
    setActiveFilter: (state, action) => {
      state.filters.active = action.payload;
      state.pagination.currentPage = 1;
    },
    
    setFeaturedFilter: (state, action) => {
      state.filters.featured = action.payload;
      state.pagination.currentPage = 1;
    },
    
    setSortBy: (state, action) => {
      state.filters.sortBy = action.payload;
    },
    
    setSortOrder: (state, action) => {
      state.filters.sortOrder = action.payload;
    },
    
    clearFilters: (state) => {
      state.filters = {
        search: '',
        active: true,
        featured: null,
        sortBy: 'order',
        sortOrder: 'asc',
      };
      state.pagination.currentPage = 1;
    },
    
    // Vista y paginación
    setViewMode: (state, action) => {
      state.viewMode = action.payload;
      localStorage.setItem('categories-view-mode', action.payload);
    },
    
    setCurrentPage: (state, action) => {
      state.pagination.currentPage = action.payload;
    },
    
    setItemsPerPage: (state, action) => {
      state.pagination.itemsPerPage = action.payload;
      state.pagination.currentPage = 1; // Reset página
    },
    
    // UI States
    toggleFilters: (state) => {
      state.ui.showFilters = !state.ui.showFilters;
    },
    
    setShowFilters: (state, action) => {
      state.ui.showFilters = action.payload;
    },
    
    setSelectedCategory: (state, action) => {
      state.ui.selectedCategory = action.payload;
    },
    
    // Modales
    openDetailModal: (state, action) => {
      state.ui.isDetailModalOpen = true;
      state.ui.selectedCategory = action.payload || null;
    },
    
    closeDetailModal: (state) => {
      state.ui.isDetailModalOpen = false;
      state.ui.selectedCategory = null;
    },
    
    openCreateModal: (state) => {
      state.ui.isCreateModalOpen = true;
    },
    
    closeCreateModal: (state) => {
      state.ui.isCreateModalOpen = false;
    },
    
    openEditModal: (state, action) => {
      state.ui.isEditModalOpen = true;
      state.ui.selectedCategory = action.payload;
    },
    
    closeEditModal: (state) => {
      state.ui.isEditModalOpen = false;
      state.ui.selectedCategory = null;
    },
    
    closeAllModals: (state) => {
      state.ui.isDetailModalOpen = false;
      state.ui.isCreateModalOpen = false;
      state.ui.isEditModalOpen = false;
      state.ui.selectedCategory = null;
    },
    
    // Datos computados (actualizados desde componentes)
    setComputedData: (state, action) => {
      state.computed = { ...state.computed, ...action.payload };
    },
  },
});

export const {
  // Filtros
  setSearchFilter,
  setActiveFilter,
  setFeaturedFilter,
  setSortBy,
  setSortOrder,
  clearFilters,
  
  // Vista y paginación
  setViewMode,
  setCurrentPage,
  setItemsPerPage,
  
  // UI States
  toggleFilters,
  setShowFilters,
  setSelectedCategory,
  
  // Modales
  openDetailModal,
  closeDetailModal,
  openCreateModal,
  closeCreateModal,
  openEditModal,
  closeEditModal,
  closeAllModals,
  
  // Computed
  setComputedData,
} = categoriesSlice.actions;

// Selectores
export const selectCategoriesFilters = (state) => state.categories?.filters || initialState.filters;
export const selectCategoriesViewMode = (state) => state.categories?.viewMode || initialState.viewMode;
export const selectCategoriesPagination = (state) => state.categories?.pagination || initialState.pagination;
export const selectCategoriesUI = (state) => state.categories?.ui || initialState.ui;
export const selectCategoriesComputed = (state) => state.categories?.computed || initialState.computed;

// Selectores específicos
export const selectSearchFilter = (state) => selectCategoriesFilters(state).search;
export const selectSelectedCategory = (state) => selectCategoriesUI(state).selectedCategory;
export const selectIsDetailModalOpen = (state) => selectCategoriesUI(state).isDetailModalOpen;
export const selectIsCreateModalOpen = (state) => selectCategoriesUI(state).isCreateModalOpen;
export const selectIsEditModalOpen = (state) => selectCategoriesUI(state).isEditModalOpen;
export const selectCurrentPage = (state) => selectCategoriesPagination(state).currentPage;
export const selectItemsPerPage = (state) => selectCategoriesPagination(state).itemsPerPage;

// Selectores computados
export const selectActiveFilters = (state) => {
  const filters = selectCategoriesFilters(state);
  const activeFilters = [];
  
  if (filters.search) activeFilters.push({ key: 'search', value: filters.search });
  if (filters.featured !== null) activeFilters.push({ key: 'featured', value: filters.featured });
  if (!filters.active) activeFilters.push({ key: 'active', value: false });
  
  return activeFilters;
};

export const selectHasActiveFilters = (state) => {
  return selectActiveFilters(state).length > 0;
};

export default categoriesSlice.reducer;