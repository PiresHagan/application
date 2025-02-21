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
    saveInsured: builder.mutation({
      query: (data) => ({
        url: '/api/insured',
        method: 'POST',
        body: data,
      }),
    }),
    updateInsured: builder.mutation({
      query: ({ clientGUID, data }) => ({
        url: `/api/insured/${clientGUID}`,
        method: 'PUT',
        body: data,
      }),
    }),
    getFormOwners: builder.query({
      query: (formNumber) => `/api/form/${formNumber}/owners`,
    }),
  }),
});

export const {
  useGetDropdownValuesQuery,
  useSaveOwnersMutation,
  useSaveInsuredMutation,
  useUpdateInsuredMutation,
  useGetFormOwnersQuery,
} = createApiSlice; 