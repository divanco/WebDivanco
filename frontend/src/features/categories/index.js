// Exports centralizados del feature categories

// API
export * from './categoriesApi';

// Slice
export * from './categoriesSlice';

// Re-exportar hooks de API más usados
export {
  useGetCategoriesQuery,
  useGetFeaturedCategoriesQuery,
  useGetCategoryBySlugQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useUploadCategoryImageMutation,
  useToggleCategoryFeaturedMutation,
} from './categoriesApi';

// Re-exportar acciones de slice más usadas
export {
  setSearchFilter,
  clearFilters,
  setViewMode,
  setCurrentPage,
  setSelectedCategory,
  openDetailModal,
  closeDetailModal,
  openCreateModal,
  closeCreateModal,
} from './categoriesSlice';

// Re-exportar selectores más usados
export {
  selectCategoriesFilters,
  selectCategoriesViewMode,
  selectSelectedCategory,
  selectSearchFilter,
  selectCurrentPage,
  selectHasActiveFilters,
} from './categoriesSlice';

// Reducer default export
export { default as categoriesReducer } from './categoriesSlice';