import { createApi } from "@reduxjs/toolkit/query/react";
import CustomAxios from "./customAxios";
import { toast } from "react-toastify";

interface CustomAxiosProps {
  url: string;
  method?: "GET" | "POST" | "PATCH" | "DELETE" | "PUT";
  params?: Record<string, any>;
  body?: Record<string, any> | FormData;
  formData?: boolean;
}

const baseQuery = async ({ url, method = "GET", body, params, formData }: CustomAxiosProps) => {
  try {
    // Pass data directly - customAxios will handle Content-Type for FormData
    const result = await CustomAxios({ 
      url, 
      method, 
      params, 
      data: body
    });
    return { data: result.data };
  } catch (axiosError: any) {
    console.error("API Error:", axiosError);
    toast.error(axiosError?.message || 'Failed to add menu item');

    const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || "Unknown error occurred";
    return { error: { status: axiosError.response?.status, message: errorMessage } };
  }
};

export const baseApi = createApi({
  baseQuery,
  reducerPath: "api",
  endpoints: () => ({}),
  tagTypes: ["PRODUCTS", "ORDERS", "SHOPS", "TRANSACTION", "TEMPLATE", "INVENTORY", "MENU", "SUBSCRIPTION_PLAN", "SUPPLY_REQUEST", "VENDORS", "VatConfig", "ServiceFeeConfig", "BRANCHES", "BANK_DETAILS", "ATTENDANCE", "DEPARTMENT", "LEAVE", "ACCOUNTING", "PAYROLL", "VENDOR_INVOICES", "PAID_INVOICES", "WHATSAPP_MESSAGES"],
});

export default baseApi;
