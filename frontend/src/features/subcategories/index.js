// Exports centralizados del feature subcategories
export * from './subcategoriesApi';

// Re-exportar hooks más usados para fácil importación
export {
  useGetSubcategoriesQuery,
  useGetFeaturedSubcategoriesQuery,
  useGetSubcategoriesByCategoryQuery,
  useGetSubcategoryBySlugQuery,
} from './subcategoriesApi';