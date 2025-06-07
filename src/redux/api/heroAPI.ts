import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { HeroState } from '../../types/store';

const API_URL = process.env.PUBLIC_API_URL || 'http://localhost:5000';

export const heroAPI = createApi({
  reducerPath: 'heroAPI',
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL + '/hero',
    prepareHeaders: (headers, { getState }) => {
      // Получаем токен из стора
      const token = (getState() as any).token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    getHero: builder.query<HeroState, void>({
      query: () => '/positions',
    }),
    updateHero: builder.mutation<HeroState, Partial<HeroState>>({
      query: (body) => ({
        url: '/position',
        method: 'PUT',
        body,
      }),
    }),
  }),
});

export const { useGetHeroQuery, useUpdateHeroMutation } = heroAPI;
