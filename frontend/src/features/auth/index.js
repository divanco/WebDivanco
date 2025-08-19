// 🆕 Exportar todas las APIs desde un solo lugar

// Auth (mantener la estructura existente)
export * from './auth';

// UI (mantener la estructura existente)
export * from './ui';

// Users (mantener la estructura existente)
export * from './users';

// Nuevas features con baseApi
export * from './categories';
export * from './subcategories';
export * from './projects';
export * from './blog';
export * from './search';
export * from './subscribers';

// 🎯 Re-exportar hooks más usados para la landing page
export {
  // Categories
  useGetFeaturedCategoriesQuery,
  useGetCategoryBySlugQuery,
  
  // Subcategories
  useGetFeaturedSubcategoriesQuery,
  useGetSubcategoriesByCategoryQuery,
  
  // Projects
  useGetFeaturedProjectsQuery,
  useGetProjectsByYearQuery,
  useGetAvailableYearsQuery,
  
  // Blog
  useGetFeaturedBlogPostsQuery,
  useGetRecentBlogPostsQuery,
  
  // Search
  useLazyGlobalSearchQuery,
  useLazyGetSearchSuggestionsQuery,
  
  // Subscribers
  useSubscribeMutation,
} from './categories';