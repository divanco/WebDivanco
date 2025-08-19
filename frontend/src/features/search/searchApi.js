import { baseApi } from '../../services/api.js';

export const searchApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Búsqueda global
    globalSearch: builder.query({
      query: ({ q, limit = 12, type } = {}) => {
        const params = new URLSearchParams({ q, limit: limit.toString() });
        if (type) params.append('type', type);
        return `/search?${params}`;
      },
      keepUnusedDataFor: 0,
    }),

    // Sugerencias para autocompletado
    getSearchSuggestions: builder.query({
      query: (q) => `/search/suggestions?q=${encodeURIComponent(q)}`,
      keepUnusedDataFor: 30,
    }),

    // Búsqueda avanzada
    advancedSearch: builder.query({
      query: ({ q, filters = {}, limit = 20, page = 1 } = {}) => {
        const params = new URLSearchParams({
          q,
          limit: limit.toString(),
          page: page.toString(),
          ...filters,
        });
        return `/search/advanced?${params}`;
      },
      keepUnusedDataFor: 0,
    }),
  }),
});

export const {
  useGlobalSearchQuery,
  useLazyGlobalSearchQuery,
  useGetSearchSuggestionsQuery,
  useLazyGetSearchSuggestionsQuery,
  useAdvancedSearchQuery,
  useLazyAdvancedSearchQuery,
} = searchApi;