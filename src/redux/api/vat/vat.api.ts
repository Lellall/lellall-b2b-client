import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '@/redux/store';
import { configUrl } from '@/utils/config';

export interface VatConfig {
  vatEnabled: boolean;
  vatRate: number;
}

export interface VatConfigResponse {
  vatEnabled: boolean;
  vatRate: number;
}

export const vatApi = createApi({
  reducerPath: 'vatApi',
  baseQuery: fetchBaseQuery({
    baseUrl: configUrl.BACKEND_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.accessToken;
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['VatConfig'],
  endpoints: (builder) => ({
    getVatConfig: builder.query<VatConfigResponse, string>({
      query: (subdomain) => `${subdomain}/config/vat-config`,
      providesTags: ['VatConfig'],
    }),
    updateVatConfig: builder.mutation<VatConfigResponse, { subdomain: string; data: VatConfig }>({
      query: ({ subdomain, data }) => ({
        url: `${subdomain}/config/vat-config`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['VatConfig'],
    }),
  }),
});

export const { useGetVatConfigQuery, useUpdateVatConfigMutation } = vatApi;

