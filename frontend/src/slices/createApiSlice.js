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
    getCompanyProducts: builder.query({
      query: (companyName) => `/api/products/company/${companyName}`,
      keepUnusedDataFor: 600,
    }),
    getProductPlans: builder.query({
      query: (productGUID) => `/api/products/${productGUID}/plans`,
      keepUnusedDataFor: 600,
    }),
    updateApplicationPlan: builder.mutation({
      query: ({ applicationNumber, planGUID }) => ({
        url: `/api/products/application/${applicationNumber}/plan`,
        method: 'PUT',
        body: { planGUID },
      }),
    }),
    saveBaseCoverage: builder.mutation({
      query: ({ applicationNumber, coverageData }) => ({
        url: `/api/coverage/base/${applicationNumber}`,
        method: 'POST',
        body: coverageData,
      }),
      invalidatesTags: ['ApplicationData', 'FormOwners'],
    }),
  }),
});

export const {
  useGetDropdownValuesQuery,
  useSaveOwnersMutation,
  useSaveInsuredMutation,
  useUpdateInsuredMutation,
  useGetFormOwnersQuery,
  useGetCompanyProductsQuery,
  useGetProductPlansQuery,
  useUpdateApplicationPlanMutation,
  useSaveBaseCoverageMutation,
} = createApiSlice; 