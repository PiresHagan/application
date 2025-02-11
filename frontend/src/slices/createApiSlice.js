import { apiSlice } from './apiSlice';

export const createApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getDropdownValues: builder.query({
      query: () => '/api/dropdowns',
      keepUnusedDataFor: 600,
    }),
    saveOwners: builder.mutation({
      query: (ownerData) => ({
        url: '/api/owners',
        method: 'POST',
        body: ownerData,
      }),
    }),
  }),
});

export const {
  useGetDropdownValuesQuery,
  useSaveOwnersMutation,
} = createApiSlice; 