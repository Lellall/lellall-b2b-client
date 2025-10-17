import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '@/redux/store';
import { configUrl } from '@/utils/config';

export interface ServiceFeeConfig {
  serviceFeeRate: number;
  restaurantId: string;
  restaurantName: string;
  subdomain: string;
}

export interface ServiceFeeUpdateRequest {
  serviceFeeRate: number;
  userId: string;
}

export const serviceFeeApi = createApi({
  reducerPath: 'serviceFeeApi',
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
  tagTypes: ['ServiceFeeConfig'],
  endpoints: (builder) => ({
    getServiceFeeConfig: builder.query<ServiceFeeConfig, string>({
      query: (subdomain) => `restaurants/${subdomain}/service-fee`,
      providesTags: ['ServiceFeeConfig'],
    }),
    updateServiceFeeConfig: builder.mutation<ServiceFeeConfig, { subdomain: string; data: ServiceFeeUpdateRequest }>({
      query: ({ subdomain, data }) => ({
        url: `restaurants/${subdomain}/service-fee`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['ServiceFeeConfig'],
    }),
  }),
});

export const { useGetServiceFeeConfigQuery, useUpdateServiceFeeConfigMutation } = serviceFeeApi;
