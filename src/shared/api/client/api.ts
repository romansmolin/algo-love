import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

/**
 * RTK Query base API
 * All feature-specific APIs will inject endpoints into this base API
 */
export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    credentials: 'include', // Include cookies
  }),
  tagTypes: ['User', 'Auth', 'Match', 'Discover'],
  endpoints: () => ({}),
});
