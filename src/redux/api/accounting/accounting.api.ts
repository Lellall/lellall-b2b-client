import { baseApi } from "../../api/baseApi";
import { ErrorHandler } from "@/utils/error-handler";

// Types
export interface SalesBreakdownParams {
  subdomain: string;
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  categories?: string[];
  paymentTypes?: string[];
}

export interface RestaurantInfo {
  name: string;
  address: string;
  phone: string;
}

export interface Period {
  startDate: string | null;
  endDate: string | null;
  firstOrderDate: string | null;
  lastOrderDate: string | null;
}

export interface SalesSummary {
  firstInvoice: string | null;
  lastInvoice: string | null;
  numberOfCustomers: number;
  grandTotal: number;
  vat: number;
  serviceFee: number;
  discount: number;
  paidIn: number;
  paidOut: number;
  netTotal: number;
  noSales: number;
  subTotal: number;
  averageCheck: number;
  netSales: number;
}

export interface SalesBreakdownResponse {
  restaurant: RestaurantInfo;
  period: Period;
  summary: SalesSummary;
}

export interface CategoryBreakdownParams {
  subdomain: string;
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  categories?: string[];
  paymentTypes?: string[];
}

export interface CategoryBreakdownItem {
  category: string;
  totalRevenue: number;
  itemCount: number;
  orderCount: number;
}

export interface CategoryBreakdownResponse {
  period: Period;
  categories: CategoryBreakdownItem[];
  total: number;
}

export interface ItemBreakdownParams {
  subdomain: string;
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  categories?: string[];
  limit?: number;
}

export interface ItemBreakdownItem {
  itemId: string;
  itemName: string;
  category: string;
  quantity: number;
  totalRevenue: number;
  averagePrice: number;
  orderCount: number;
}

export interface ItemBreakdownSummary {
  totalItems: number;
  totalQuantity: number;
  totalRevenue: number;
}

export interface ItemBreakdownResponse {
  period: Period;
  items: ItemBreakdownItem[];
  summary: ItemBreakdownSummary;
}

export interface PaymentBreakdownParams {
  subdomain: string;
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  categories?: string[];
  paymentTypes?: string[];
}

export interface PaymentBreakdownItem {
  paymentType: string; // CASH, TRANSFER, CARD, ONLINE, DELIVERY, UNPAID
  orderCount: number;
  totalSubtotal: number;
  totalDiscount: number;
  totalVAT: number;
  totalServiceFee: number;
  totalRevenue: number;
}

export interface PaymentBreakdownResponse {
  period: Period;
  breakdown: PaymentBreakdownItem[];
  totalRevenue: number;
}

export interface SelectedItemsBreakdownParams {
  subdomain: string;
  itemIds: string[];
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  paymentTypes?: string[];
}

export interface OrderDetail {
  orderId: string;
  quantity: number;
  revenue: number;
  date: string; // YYYY-MM-DD
  waiter?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface SelectedItemBreakdown {
  itemId: string;
  itemName: string;
  category: string;
  quantity: number;
  totalRevenue: number;
  averagePrice: number;
  orderCount: number;
  orders: OrderDetail[];
}

export interface SelectedItemsBreakdownResponse {
  period: Period;
  items: SelectedItemBreakdown[];
  summary: ItemBreakdownSummary;
}

export interface StaffBreakdownParams {
  subdomain: string;
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  staffIds?: string[];
  paymentTypes?: string[];
}

export interface StaffOrder {
  orderId: string;
  date: string; // YYYY-MM-DD
  subtotal: number;
  discount: number;
  vat: number;
  serviceFee: number;
  total: number;
  itemCount: number;
}

export interface StaffBreakdownItem {
  staffId: string;
  staffName: string;
  staffEmail: string;
  employeeId: string | null;
  orderCount: number;
  totalSubtotal: number;
  totalDiscount: number;
  totalVAT: number;
  totalServiceFee: number;
  totalRevenue: number;
  averageOrderValue: number;
  itemsSold: number;
  orders: StaffOrder[];
}

export interface StaffBreakdownSummary {
  totalStaff: number;
  totalOrders: number;
  totalItemsSold: number;
  totalRevenue: number;
  averageOrderValue: number;
}

export interface StaffBreakdownResponse {
  period: Period;
  staff: StaffBreakdownItem[];
  summary: StaffBreakdownSummary;
}

export const accountingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get Sales Breakdown
    getSalesBreakdown: builder.query<SalesBreakdownResponse, SalesBreakdownParams>({
      query: ({ subdomain, startDate, endDate, categories, paymentTypes }) => {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (categories && categories.length > 0) {
          categories.forEach((cat) => params.append('categories', cat));
        }
        if (paymentTypes && paymentTypes.length > 0) {
          paymentTypes.forEach((type) => params.append('paymentTypes', type));
        }

        const queryString = params.toString();
        return {
          url: `/accounting/${subdomain}/sales-breakdown${queryString ? `?${queryString}` : ''}`,
          method: 'GET',
          credentials: 'include',
        };
      },
      providesTags: ['ACCOUNTING'],
      async onQueryStarted(_args, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (err: any) {
          ErrorHandler(err);
          console.error('Failed to fetch sales breakdown:', err);
        }
      },
    }),

    // Get Category Breakdown
    getCategoryBreakdown: builder.query<CategoryBreakdownResponse, CategoryBreakdownParams>({
      query: ({ subdomain, startDate, endDate, categories, paymentTypes }) => {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (categories && categories.length > 0) {
          categories.forEach((cat) => params.append('categories', cat));
        }
        if (paymentTypes && paymentTypes.length > 0) {
          paymentTypes.forEach((type) => params.append('paymentTypes', type));
        }

        const queryString = params.toString();
        return {
          url: `/accounting/${subdomain}/category-breakdown${queryString ? `?${queryString}` : ''}`,
          method: 'GET',
          credentials: 'include',
        };
      },
      providesTags: ['ACCOUNTING'],
      async onQueryStarted(_args, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (err: any) {
          ErrorHandler(err);
          console.error('Failed to fetch category breakdown:', err);
        }
      },
    }),

    // Get Item Breakdown
    getItemBreakdown: builder.query<ItemBreakdownResponse, ItemBreakdownParams>({
      query: ({ subdomain, startDate, endDate, categories, limit }) => {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (categories && categories.length > 0) {
          categories.forEach((cat) => params.append('categories', cat));
        }
        if (limit) params.append('limit', limit.toString());

        const queryString = params.toString();
        return {
          url: `/accounting/${subdomain}/item-breakdown${queryString ? `?${queryString}` : ''}`,
          method: 'GET',
          credentials: 'include',
        };
      },
      providesTags: ['ACCOUNTING'],
      async onQueryStarted(_args, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (err: any) {
          ErrorHandler(err);
          console.error('Failed to fetch item breakdown:', err);
        }
      },
    }),

    // Get Payment Breakdown
    getPaymentBreakdown: builder.query<PaymentBreakdownResponse, PaymentBreakdownParams>({
      query: ({ subdomain, startDate, endDate, categories, paymentTypes }) => {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (categories && categories.length > 0) {
          categories.forEach((cat) => params.append('categories', cat));
        }
        if (paymentTypes && paymentTypes.length > 0) {
          paymentTypes.forEach((type) => params.append('paymentTypes', type));
        }

        const queryString = params.toString();
        return {
          url: `/accounting/${subdomain}/payment-breakdown${queryString ? `?${queryString}` : ''}`,
          method: 'GET',
          credentials: 'include',
        };
      },
      providesTags: ['ACCOUNTING'],
      async onQueryStarted(_args, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (err: any) {
          ErrorHandler(err);
          console.error('Failed to fetch payment breakdown:', err);
        }
      },
    }),

    // Get Selected Items Breakdown
    getSelectedItemsBreakdown: builder.mutation<SelectedItemsBreakdownResponse, SelectedItemsBreakdownParams>({
      query: ({ subdomain, itemIds, startDate, endDate, paymentTypes }) => {
        return {
          url: `/accounting/${subdomain}/selected-items-breakdown`,
          method: 'POST',
          body: {
            itemIds,
            startDate,
            endDate,
            paymentTypes,
          },
          credentials: 'include',
        };
      },
      invalidatesTags: ['ACCOUNTING'],
      async onQueryStarted(_args, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (err: any) {
          ErrorHandler(err);
          console.error('Failed to fetch selected items breakdown:', err);
        }
      },
    }),

    // Get Staff Breakdown
    getStaffBreakdown: builder.query<StaffBreakdownResponse, StaffBreakdownParams>({
      query: ({ subdomain, startDate, endDate, staffIds, paymentTypes }) => {
        const params = new URLSearchParams();
        if (startDate) params.append('startDate', startDate);
        if (endDate) params.append('endDate', endDate);
        if (staffIds && staffIds.length > 0) {
          staffIds.forEach((id) => params.append('staffIds', id));
        }
        if (paymentTypes && paymentTypes.length > 0) {
          paymentTypes.forEach((type) => params.append('paymentTypes', type));
        }

        const queryString = params.toString();
        return {
          url: `/accounting/${subdomain}/staff-breakdown${queryString ? `?${queryString}` : ''}`,
          method: 'GET',
          credentials: 'include',
        };
      },
      providesTags: ['ACCOUNTING'],
      async onQueryStarted(_args, { queryFulfilled }) {
        try {
          await queryFulfilled;
        } catch (err: any) {
          ErrorHandler(err);
          console.error('Failed to fetch staff breakdown:', err);
        }
      },
    }),
  }),
});

export const {
  useGetSalesBreakdownQuery,
  useGetCategoryBreakdownQuery,
  useGetItemBreakdownQuery,
  useGetPaymentBreakdownQuery,
  useGetSelectedItemsBreakdownMutation,
  useGetStaffBreakdownQuery,
} = accountingApi;

