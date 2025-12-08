import { baseApi } from '../baseApi';
import { toast } from 'react-toastify';
import { ErrorHandler } from '@/utils/error-handler';

// Types
export interface VendorInvoice {
  id: string;
  restaurantId: string;
  vendorId: string;
  supplyRequestId?: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string;
  totalAmount: number;
  taxAmount?: number;
  subtotal?: number;
  currency: string;
  status: 'PENDING' | 'RECEIVED' | 'VERIFIED' | 'PAID' | 'REJECTED' | 'OVERDUE';
  description?: string;
  notes?: string;
  fileUrl?: string;
  fileName?: string;
  vendor?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
  uploadedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  verifiedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  verifiedAt?: string;
  paidAt?: string;
  paymentMethod?: string;
  paymentReference?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaidInvoice {
  id: string;
  restaurantId: string;
  vendorId: string;
  supplyRequestId?: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string;
  totalAmount: number;
  taxAmount?: number;
  subtotal?: number;
  currency: string;
  status: 'DRAFT' | 'GENERATED' | 'SENT' | 'PAID' | 'CANCELLED';
  description?: string;
  notes?: string;
  pdfUrl?: string;
  vendor?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
  invoiceItems?: PaidInvoiceItem[];
  generatedBy?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  sentAt?: string;
  paidAt?: string;
  paymentMethod?: string;
  paymentReference?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaidInvoiceItem {
  id?: string;
  itemName: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface UploadVendorInvoiceRequest {
  vendorId: string;
  supplyRequestId?: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate?: string;
  totalAmount: number;
  taxAmount?: number;
  subtotal?: number;
  currency?: string;
  description?: string;
  notes?: string;
  file?: File;
}

export interface UpdateVendorInvoiceRequest {
  invoiceNumber?: string;
  invoiceDate?: string;
  dueDate?: string;
  totalAmount?: number;
  taxAmount?: number;
  subtotal?: number;
  status?: string;
  description?: string;
  notes?: string;
}

export interface VerifyVendorInvoiceRequest {
  notes?: string;
}

export interface MarkPaidRequest {
  paymentMethod: string;
  paymentReference: string;
  notes?: string;
}

export interface GeneratePaidInvoiceRequest {
  vendorId: string;
  supplyRequestId?: string;
  dueDate?: string;
  items: PaidInvoiceItem[];
  taxAmount?: number;
  currency?: string;
  description?: string;
  notes?: string;
  sendEmail?: boolean;
}

export interface GetVendorInvoicesParams {
  subdomain: string;
  vendorId?: string;
  status?: string;
  supplyRequestId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface VendorInvoicesResponse {
  data: VendorInvoice[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PaidInvoicesResponse {
  data: PaidInvoice[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const vendorInvoicesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Vendor Invoices
    uploadVendorInvoice: builder.mutation<VendorInvoice, { subdomain: string; data: UploadVendorInvoiceRequest }>({
      query: ({ subdomain, data }) => {
        const formData = new FormData();
        formData.append('vendorId', data.vendorId);
        if (data.supplyRequestId) formData.append('supplyRequestId', data.supplyRequestId);
        formData.append('invoiceNumber', data.invoiceNumber);
        formData.append('invoiceDate', data.invoiceDate);
        if (data.dueDate) formData.append('dueDate', data.dueDate);
        
        // Ensure totalAmount is a valid number and always append it (required field)
        const totalAmount = typeof data.totalAmount === 'number' ? data.totalAmount : parseFloat(String(data.totalAmount));
        if (isNaN(totalAmount) || totalAmount < 0) {
          throw new Error('totalAmount must be a valid number >= 0');
        }
        // Send as plain string representation of the number
        formData.append('totalAmount', String(totalAmount));
        
        // Only append taxAmount if it's provided and valid
        if (data.taxAmount !== undefined && data.taxAmount !== null) {
          const taxAmount = typeof data.taxAmount === 'number' ? data.taxAmount : parseFloat(String(data.taxAmount));
          if (!isNaN(taxAmount) && taxAmount >= 0) {
            formData.append('taxAmount', String(taxAmount));
          }
        }
        
        // Only append subtotal if it's provided and valid
        if (data.subtotal !== undefined && data.subtotal !== null) {
          const subtotal = typeof data.subtotal === 'number' ? data.subtotal : parseFloat(String(data.subtotal));
          if (!isNaN(subtotal) && subtotal >= 0) {
            formData.append('subtotal', String(subtotal));
          }
        }
        
        if (data.currency) formData.append('currency', data.currency);
        if (data.description) formData.append('description', data.description);
        if (data.notes) formData.append('notes', data.notes);
        if (data.file) formData.append('file', data.file);

        return {
          url: `${subdomain}/vendor-invoices/upload`,
          method: 'POST',
          body: formData,
          credentials: 'include',
          formData: true,
        };
      },
      invalidatesTags: ['VENDOR_INVOICES'],
      async onQueryStarted(_args, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Vendor invoice uploaded successfully');
        } catch (err: any) {
          ErrorHandler(err);
          toast.error(err?.error?.data?.message || 'Failed to upload vendor invoice');
          throw err;
        }
      },
    }),

    getVendorInvoices: builder.query<VendorInvoicesResponse, GetVendorInvoicesParams>({
      query: ({ subdomain, vendorId, status, supplyRequestId, startDate, endDate, page = 1, limit = 10 }) => {
        const params = new URLSearchParams();
        if (vendorId) params.append('vendorId', vendorId);
        if (status) params.append('status', status);
        if (supplyRequestId) params.append('supplyRequestId', supplyRequestId);
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        params.append('page', page.toString());
        params.append('limit', limit.toString());

        return {
          url: `${subdomain}/vendor-invoices?${params.toString()}`,
          method: 'GET',
          credentials: 'include',
        };
      },
      providesTags: ['VENDOR_INVOICES'],
    }),

    getVendorInvoiceById: builder.query<VendorInvoice, { subdomain: string; invoiceId: string }>({
      query: ({ subdomain, invoiceId }) => ({
        url: `${subdomain}/vendor-invoices/${invoiceId}`,
        method: 'GET',
        credentials: 'include',
      }),
      providesTags: (result, error, { invoiceId }) => [{ type: 'VENDOR_INVOICES', id: invoiceId }],
    }),

    updateVendorInvoice: builder.mutation<VendorInvoice, { subdomain: string; invoiceId: string; data: UpdateVendorInvoiceRequest }>({
      query: ({ subdomain, invoiceId, data }) => ({
        url: `${subdomain}/vendor-invoices/${invoiceId}`,
        method: 'PATCH',
        body: data,
        credentials: 'include',
      }),
      invalidatesTags: (result, error, { invoiceId }) => [
        { type: 'VENDOR_INVOICES', id: invoiceId },
        'VENDOR_INVOICES',
      ],
      async onQueryStarted(_args, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Vendor invoice updated successfully');
        } catch (err: any) {
          ErrorHandler(err);
          toast.error(err?.error?.data?.message || 'Failed to update vendor invoice');
          throw err;
        }
      },
    }),

    verifyVendorInvoice: builder.mutation<VendorInvoice, { subdomain: string; invoiceId: string; data: VerifyVendorInvoiceRequest }>({
      query: ({ subdomain, invoiceId, data }) => ({
        url: `${subdomain}/vendor-invoices/${invoiceId}/verify`,
        method: 'POST',
        body: data,
        credentials: 'include',
      }),
      invalidatesTags: (result, error, { invoiceId }) => [
        { type: 'VENDOR_INVOICES', id: invoiceId },
        'VENDOR_INVOICES',
      ],
      async onQueryStarted(_args, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Vendor invoice verified successfully');
        } catch (err: any) {
          ErrorHandler(err);
          toast.error(err?.error?.data?.message || 'Failed to verify vendor invoice');
          throw err;
        }
      },
    }),

    markVendorInvoicePaid: builder.mutation<VendorInvoice, { subdomain: string; invoiceId: string; data: MarkPaidRequest }>({
      query: ({ subdomain, invoiceId, data }) => ({
        url: `${subdomain}/vendor-invoices/${invoiceId}/mark-paid`,
        method: 'POST',
        body: data,
        credentials: 'include',
      }),
      invalidatesTags: (result, error, { invoiceId }) => [
        { type: 'VENDOR_INVOICES', id: invoiceId },
        'VENDOR_INVOICES',
      ],
      async onQueryStarted(_args, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Vendor invoice marked as paid successfully');
        } catch (err: any) {
          ErrorHandler(err);
          toast.error(err?.error?.data?.message || 'Failed to mark invoice as paid');
          throw err;
        }
      },
    }),

    // Paid Invoices
    generatePaidInvoice: builder.mutation<PaidInvoice, { subdomain: string; data: GeneratePaidInvoiceRequest }>({
      query: ({ subdomain, data }) => ({
        url: `${subdomain}/vendor-invoices/paid/generate`,
        method: 'POST',
        body: data,
        credentials: 'include',
      }),
      invalidatesTags: ['PAID_INVOICES'],
      async onQueryStarted(_args, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Paid invoice generated successfully');
        } catch (err: any) {
          ErrorHandler(err);
          toast.error(err?.error?.data?.message || 'Failed to generate paid invoice');
          throw err;
        }
      },
    }),

    getPaidInvoices: builder.query<PaidInvoicesResponse, GetVendorInvoicesParams>({
      query: ({ subdomain, vendorId, status, supplyRequestId, startDate, endDate, page = 1, limit = 10 }) => {
        const params = new URLSearchParams();
        if (vendorId) params.append('vendorId', vendorId);
        if (status) params.append('status', status);
        if (supplyRequestId) params.append('supplyRequestId', supplyRequestId);
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        params.append('page', page.toString());
        params.append('limit', limit.toString());

        return {
          url: `${subdomain}/vendor-invoices/paid?${params.toString()}`,
          method: 'GET',
          credentials: 'include',
        };
      },
      providesTags: ['PAID_INVOICES'],
    }),

    getPaidInvoiceById: builder.query<PaidInvoice, { subdomain: string; invoiceId: string }>({
      query: ({ subdomain, invoiceId }) => ({
        url: `${subdomain}/vendor-invoices/paid/${invoiceId}`,
        method: 'GET',
        credentials: 'include',
      }),
      providesTags: (result, error, { invoiceId }) => [{ type: 'PAID_INVOICES', id: invoiceId }],
    }),

    updatePaidInvoice: builder.mutation<PaidInvoice, { subdomain: string; invoiceId: string; data: Partial<PaidInvoice> }>({
      query: ({ subdomain, invoiceId, data }) => ({
        url: `${subdomain}/vendor-invoices/paid/${invoiceId}`,
        method: 'PATCH',
        body: data,
        credentials: 'include',
      }),
      invalidatesTags: (result, error, { invoiceId }) => [
        { type: 'PAID_INVOICES', id: invoiceId },
        'PAID_INVOICES',
      ],
      async onQueryStarted(_args, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Paid invoice updated successfully');
        } catch (err: any) {
          ErrorHandler(err);
          toast.error(err?.error?.data?.message || 'Failed to update paid invoice');
          throw err;
        }
      },
    }),

    markPaidInvoicePaid: builder.mutation<PaidInvoice, { subdomain: string; invoiceId: string; data: MarkPaidRequest }>({
      query: ({ subdomain, invoiceId, data }) => ({
        url: `${subdomain}/vendor-invoices/paid/${invoiceId}/mark-paid`,
        method: 'POST',
        body: data,
        credentials: 'include',
      }),
      invalidatesTags: (result, error, { invoiceId }) => [
        { type: 'PAID_INVOICES', id: invoiceId },
        'PAID_INVOICES',
      ],
      async onQueryStarted(_args, { queryFulfilled }) {
        try {
          await queryFulfilled;
          toast.success('Paid invoice marked as paid successfully');
        } catch (err: any) {
          ErrorHandler(err);
          toast.error(err?.error?.data?.message || 'Failed to mark invoice as paid');
          throw err;
        }
      },
    }),
  }),
});

export const {
  useUploadVendorInvoiceMutation,
  useGetVendorInvoicesQuery,
  useGetVendorInvoiceByIdQuery,
  useUpdateVendorInvoiceMutation,
  useVerifyVendorInvoiceMutation,
  useMarkVendorInvoicePaidMutation,
  useGeneratePaidInvoiceMutation,
  useGetPaidInvoicesQuery,
  useGetPaidInvoiceByIdQuery,
  useUpdatePaidInvoiceMutation,
  useMarkPaidInvoicePaidMutation,
} = vendorInvoicesApi;

