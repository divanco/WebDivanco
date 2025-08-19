import { baseApi } from '../../services/api.js';

export const subscribersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Suscribirse al newsletter
    subscribe: builder.mutation({
      query: (email) => ({
        url: '/subscribers',
        method: 'POST',
        body: { email },
      }),
      invalidatesTags: ['Subscriber'],
    }),

    // Cancelar suscripción
    unsubscribe: builder.mutation({
      query: (token) => ({
        url: `/subscribers/unsubscribe/${token}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Subscriber'],
    }),

    // Admin: Obtener estadísticas
    getSubscriberStats: builder.query({
      query: () => '/subscribers/stats',
      providesTags: ['Subscriber'],
    }),

    // Admin: Lista de suscriptores
    getSubscribers: builder.query({
      query: ({ limit = 50, page = 1, active = true } = {}) => {
        const params = new URLSearchParams({
          limit: limit.toString(),
          page: page.toString(),
          active: active.toString(),
        });
        return `/subscribers?${params}`;
      },
      providesTags: ['Subscriber'],
    }),
  }),
});

export const {
  useSubscribeMutation,
  useUnsubscribeMutation,
  useGetSubscriberStatsQuery,
  useGetSubscribersQuery,
} = subscribersApi;