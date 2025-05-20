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
      transformResponse: (response) => {
        return response;
      },
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
    getAdditionalCoverageDefinitions: builder.query({
      query: (planGUID) => `/api/coverage/additional-definitions/${planGUID}`,
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
    searchApplications: builder.query({
      query: (params) => {
        const queryParams = new URLSearchParams();
        if (params.applicationNumber) queryParams.append('applicationNumber', params.applicationNumber);
        if (params.firstName) queryParams.append('firstName', params.firstName);
        if (params.lastName) queryParams.append('lastName', params.lastName);
        if (params.companyName) queryParams.append('companyName', params.companyName);
        if (params.ownerType) queryParams.append('ownerType', params.ownerType);
        if (params.currentUserOnly) queryParams.append('currentUserOnly', params.currentUserOnly);

        if (params.page !== undefined) queryParams.append('page', params.page);
        if (params.size !== undefined) queryParams.append('size', params.size);

        return {
          url: `/api/search/application?${queryParams.toString()}`,
          method: 'GET',
        };
      },
      keepUnusedDataFor: 0,
    }),
    getMyApplications: builder.query({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.page !== undefined) queryParams.append('page', params.page);
        if (params.size !== undefined) queryParams.append('size', params.size);

        return {
          url: `/api/search/application/my?${queryParams.toString()}`,
          method: 'GET',
        };
      },
      keepUnusedDataFor: 0,
    }),
    saveMedicalData: builder.mutation({
      query: ({ roleGUID, medicalData }) => ({
        url: `/api/medical/save/${roleGUID}`,
        method: 'POST',
        body: medicalData
      })
    }),
    getApplicationPremium: builder.query({
      query: (applicationNumber) => `/api/premium/${applicationNumber}`,
      keepUnusedDataFor: 60,
    }),
    savePaymentData: builder.mutation({
      query: ({ applicationNumber, paymentData }) => ({
        url: `/api/payment/${applicationNumber}`,
        method: 'POST',
        body: paymentData
      })
    }),
    saveBeneficiaryAllocations: builder.mutation({
      query: (data) => ({
        url: '/api/beneficiaries/allocations',
        method: 'POST',
        body: data
      })
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
  useGetAdditionalCoverageDefinitionsQuery,
  useUpdateApplicationPlanMutation,
  useSaveBaseCoverageMutation,
  useSearchApplicationsQuery,
  useGetMyApplicationsQuery,
  useSaveMedicalDataMutation,
  useGetApplicationPremiumQuery,
  useSavePaymentDataMutation,
  useSaveBeneficiaryAllocationsMutation,
} = createApiSlice; 