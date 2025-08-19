// 🆕 Exportar todas las features desde un solo lugar

// Features existentes (ahora con exports organizados)
export * from './auth';
export * from './ui';
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
  // Auth
  useLoginMutation,
  useLogoutUserMutation,
  selectIsAuthenticated,
  selectUser,
  
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
} from './auth';