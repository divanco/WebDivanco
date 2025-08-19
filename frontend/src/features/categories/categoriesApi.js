import { baseApi } from '../../services/api.js';

export const categoriesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Obtener todas las categorías
    getCategories: builder.query({
      query: ({ limit = 20, page = 1, active = true } = {}) => 
        `/categories?limit=${limit}&page=${page}&active=${active}`,
      providesTags: ['Category'],
    }),

    // Categorías para la homepage
    getFeaturedCategories: builder.query({
      query: (limit = 8) => `/categories/featured?limit=${limit}`,
      providesTags: ['Category'],
    }),

    // Obtener categoría por slug con subcategorías
    getCategoryBySlug: builder.query({
      query: (slug) => `/categories/${slug}`,
      providesTags: (result, error, slug) => [
        { type: 'Category', id: slug },
        'Subcategory'
      ],
    }),

    // Admin: Crear categoría
    createCategory: builder.mutation({
      query: (categoryData) => ({
        url: '/categories',
        method: 'POST',
        body: categoryData,
      }),
      invalidatesTags: ['Category'],
    }),

    // Admin: Actualizar categoría
    updateCategory: builder.mutation({
      query: ({ slug, ...data }) => ({
        url: `/categories/${slug}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { slug }) => [
        { type: 'Category', id: slug },
        'Category'
      ],
    }),

    // Admin: Subir imagen a categoría
    uploadCategoryImage: builder.mutation({
      query: ({ slug, formData }) => ({
        url: `/categories/${slug}/upload-image`,
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: (result, error, { slug }) => [
        { type: 'Category', id: slug }
      ],
    }),

    // Admin: Toggle featured
    toggleCategoryFeatured: builder.mutation({
      query: (slug) => ({
        url: `/categories/${slug}/toggle-featured`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, slug) => [
        { type: 'Category', id: slug },
        'Category'
      ],
    }),
  }),
});

export const {
  useGetCategoriesQuery,
  useGetFeaturedCategoriesQuery,
  useGetCategoryBySlugQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useUploadCategoryImageMutation,
  useToggleCategoryFeaturedMutation,
} = categoriesApi;