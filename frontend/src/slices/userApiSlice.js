import { apiSlice } from './apiSlice';

export const userApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query({
      query: (params = {}) => {
        const queryParams = new URLSearchParams();
        if (params.page !== undefined) queryParams.append('page', params.page);
        if (params.size !== undefined) queryParams.append('size', params.size);
        
        return {
          url: `/api/users/admin?${queryParams.toString()}`,
          method: 'GET',
        };
      },
      keepUnusedDataFor: 0,
    }),
    
    getUserById: builder.query({
      query: (id) => ({
        url: `/api/users/admin/${id}`,
        method: 'GET',
      }),
    }),
    
    createUser: builder.mutation({
      query: (userData) => ({
        url: '/api/users/admin',
        method: 'POST',
        body: userData,
      }),
    }),
    
    updateUser: builder.mutation({
      query: ({ id, userData }) => ({
        url: `/api/users/admin/${id}`,
        method: 'PUT',
        body: userData,
      }),
    }),
    
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `/api/users/admin/${id}`,
        method: 'DELETE',
      }),
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = userApiSlice; 