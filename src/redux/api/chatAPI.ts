import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';

interface Message {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
}

export const chatApi = createApi({
  reducerPath: 'chatApi',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.PUBLIC_API_URL || 'http://localhost:5000',
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).token;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['Messages'],
  endpoints: (builder) => ({
    getMessages: builder.query<Message[], void>({
      query: () => '/chat/messages',
      providesTags: ['Messages'],
    }),
    sendMessage: builder.mutation<Message, Omit<Message, 'id'>>({
      query: (message) => ({
        url: '/chat/messages',
        method: 'POST',
        body: message,
      }),
      invalidatesTags: ['Messages'],
    }),
  }),
});

export const { useGetMessagesQuery, useSendMessageMutation } = chatApi;
