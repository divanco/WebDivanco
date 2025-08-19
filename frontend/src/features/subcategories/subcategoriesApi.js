import { baseApi } from '../../services/api.js';

export const subcategoriesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Obtener todas las subcategorías
    getSubcategories: builder.query({
      query: ({ limit = 20, page = 1, active = true, featured, categoryId } = {}) => {
        const params = new URLSearchParams({
          limit: limit.toString(),
          page: page.toString(),
          active: active.toString(),
        });
        
        if (featured !== undefined) params.append('featured', featured.toString());
        if (categoryId) params.append('categoryId', categoryId.toString());
        
        return `/subcategories?${params}`;
      },
      providesTags: ['Subcategory'],
    }),

    // Subcategorías destacadas para homepage
    getFeaturedSubcategories: builder.query({
      query: (limit = 6) => `/subcategories/featured?limit=${limit}`,
      providesTags: ['Subcategory'],
    }),

    // Subcategorías por categoría
    getSubcategoriesByCategory: builder.query({
      query: ({ categorySlug, limit = 20, page = 1 }) => {
        const params = new URLSearchParams({
          limit: limit.toString(),
          page: page.toString(),
        });
        return `/categories/${categorySlug}/subcategories?${params}`;
      },
      providesTags: ['Subcategory'],
    }),

    // Obtener subcategoría por slug
    getSubcategoryBySlug: builder.query({
      query: (slug) => `/subcategories/${slug}`,
      providesTags: (result, error, slug) => [
        { type: 'Subcategory', id: slug }
      ],
    }),

    // Subcategorías relacionadas
    getRelatedSubcategories: builder.query({
      query: ({ slug, limit = 4 }) => `/subcategories/${slug}/related?limit=${limit}`,
      providesTags: ['Subcategory'],
    }),

    // Admin: Crear subcategoría
    createSubcategory: builder.mutation({
      query: (subcategoryData) => ({
        url: '/subcategories',
        method: 'POST',
        body: subcategoryData,
      }),
      invalidatesTags: ['Subcategory', 'Category'],
    }),

    // Admin: Actualizar subcategoría
    updateSubcategory: builder.mutation({
      query: ({ slug, ...data }) => ({
        url: `/subcategories/${slug}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { slug }) => [
        { type: 'Subcategory', id: slug },
        'Subcategory'
      ],
    }),

    // Admin: Eliminar subcategoría
    deleteSubcategory: builder.mutation({
      query: (slug) => ({
        url: `/subcategories/${slug}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Subcategory', 'Category'],
    }),

    // Admin: Subir imagen a subcategoría
    uploadSubcategoryImage: builder.mutation({
      query: ({ slug, formData }) => ({
        url: `/subcategories/${slug}/upload-image`,
        method: 'POST',
        body: formData,
      }),
      invalidatesTags: (result, error, { slug }) => [
        { type: 'Subcategory', id: slug }
      ],
    }),

    // Admin: Cambiar estado featured
    toggleSubcategoryFeatured: builder.mutation({
      query: (slug) => ({
        url: `/subcategories/${slug}/toggle-featured`,
        method: 'PATCH',
      }),
      invalidatesTags: (result, error, slug) => [
        { type: 'Subcategory', id: slug },
        'Subcategory'
      ],
    }),
  }),
});

export const {
  useGetSubcategoriesQuery,
  useGetFeaturedSubcategoriesQuery,
  useGetSubcategoriesByCategoryQuery,
  useGetSubcategoryBySlugQuery,
  useGetRelatedSubcategoriesQuery,
  useCreateSubcategoryMutation,
  useUpdateSubcategoryMutation,
  useDeleteSubcategoryMutation,
  useUploadSubcategoryImageMutation,
  useToggleSubcategoryFeaturedMutation,
} = subcategoriesApi;