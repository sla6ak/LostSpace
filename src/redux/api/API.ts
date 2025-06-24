import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const API_URL = process.env.PUBLIC_API_URL || 'http://localhost:5000';

export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders: (headers, { getState }: any) => {
      const token = getState().token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['user', 'messages', 'hero'],
  endpoints: (builder) => ({
    registrationUser: builder.mutation({
      query: (newUser) => ({
        url: '/auth/signup',
        method: 'POST',
        body: newUser,
      }),
      invalidatesTags: () => ['user'],
    }),
    loginUser: builder.mutation({
      query: (userData) => ({
        url: `/auth/login`,
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: () => ['user'],
    }),
    emailVerify: builder.mutation({
      query: (verificationToken) => ({
        url: `/auth/login/${verificationToken}`,
        method: 'PATCH',
      }),
      invalidatesTags: () => ['user'],
    }),
    unLoginUser: builder.mutation({
      query: () => ({
        url: `/auth/logout`,
        method: 'POST',
      }),
      invalidatesTags: () => ['user'],
    }),
    isActivToken: builder.query({
      query: () => ({
        url: `/auth/current`,
        method: 'GET',
      }),
      providesTags: () => ['user'],
    }),
    getMessages: builder.query({
      query: () => '/chat/messages',
      providesTags: () => ['messages'],
    }),
    sendMessage: builder.mutation({
      query: (message) => ({
        url: '/chat/messages',
        method: 'POST',
        body: message,
      }),
      invalidatesTags: () => ['messages'],
    }),
    getHero: builder.query({
      query: () => ({ url: `/hero/state`, method: 'GET' }),
      providesTags: () => ['hero'],
    }),
    updateHero: builder.mutation({
      query: (body) => ({
        url: '/hero/state',
        method: 'PUT',
        body,
      }),
      invalidatesTags: () => ['hero'],
    }),
  }),
});

export const {
  useIsActivTokenQuery,
  useEmailVerifyMutation,
  useRegistrationUserMutation,
  useLoginUserMutation,
  useUnLoginUserMutation,
  useGetMessagesQuery,
  useSendMessageMutation,
  useGetHeroQuery,
  useUpdateHeroMutation,
} = api;
