import { baseApi } from '../baseApi';
import { ErrorHandler } from '@/utils/error-handler';
import { toast } from 'react-toastify';

// Types
export interface WhatsAppSupplyRequest {
  id: string;
  productName: string;
  quantity: number;
  unitOfMeasurement?: string;
  status: string;
  vendor?: {
    id: string;
    name: string;
  };
}

export interface WhatsAppMessage {
  id: string;
  messageId: string;
  fromPhoneNumber: string;
  fromName?: string;
  messageText: string;
  messageType: string;
  status: 'received' | 'processed' | 'failed';
  processedAt?: string;
  createdAt: string;
  errorMessage?: string;
  supplyRequests?: WhatsAppSupplyRequest[];
}

export interface GetWhatsAppMessagesParams {
  restaurantId: string;
  page?: number;
  limit?: number;
}

export interface WhatsAppMessagesResponse {
  data: WhatsAppMessage[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// API Endpoints
export const whatsappApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get WhatsApp Messages List
    getWhatsAppMessages: builder.query<WhatsAppMessagesResponse, GetWhatsAppMessagesParams>({
      query: ({ restaurantId, page = 1, limit = 10 }) => {
        const params = new URLSearchParams();
        params.append('restaurantId', restaurantId);
        params.append('page', page.toString());
        params.append('limit', limit.toString());

        return {
          url: `webhooks/whatsapp/messages?${params.toString()}`,
          method: 'GET',
          credentials: 'include',
        };
      },
      providesTags: ['WHATSAPP_MESSAGES'],
    }),

    // Get Single WhatsApp Message
    getWhatsAppMessageById: builder.query<WhatsAppMessage, { messageId: string; restaurantId: string }>({
      query: ({ messageId, restaurantId }) => {
        const params = new URLSearchParams();
        params.append('restaurantId', restaurantId);

        return {
          url: `webhooks/whatsapp/messages/${messageId}?${params.toString()}`,
          method: 'GET',
          credentials: 'include',
        };
      },
      providesTags: (result, error, { messageId }) => [{ type: 'WHATSAPP_MESSAGES', id: messageId }],
    }),
  }),
});

export const {
  useGetWhatsAppMessagesQuery,
  useGetWhatsAppMessageByIdQuery,
} = whatsappApi;



