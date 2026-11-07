import { createApi } from "@reduxjs/toolkit/query/react";
import CustomAxios from "./customAxios";
import { toast } from "react-toastify";

interface CustomAxiosProps {
  url: string;
  method?: "GET" | "POST" | "PATCH" | "DELETE" | "PUT";
  params?: Record<string, any>;
  body?: Record<string, any> | FormData;
  formData?: boolean;
  responseType?: 'arraybuffer' | 'blob' | 'document' | 'json' | 'text' | 'stream';
}

const baseQuery = async ({ url, method = "GET", body, params, formData, responseType }: CustomAxiosProps) => {
  try {
    // Pass data directly - customAxios will handle Content-Type for FormData
    const result = await CustomAxios({
      url,
      method,
      params,
      data: body,
      responseType,
    });
    return { data: result.data };
  } catch (axiosError: any) {
    console.error("API Error:", axiosError);

    const errorMessage = axiosError.response?.data?.message || axiosError.response?.data?.error || "Unknown error occurred";
    // Show the server's own explanation when there is one, not "Request failed with status code 400".
    // The id stops the same message appearing twice when a page shows it as well.
    const shown = Array.isArray(errorMessage) ? errorMessage.join(', ') : String(errorMessage);
    toast.error(axiosError.response?.data?.message ? shown : axiosError?.message || shown, { toastId: shown });
    return { error: { status: axiosError.response?.status, message: errorMessage } };
  }
};

export const baseApi = createApi({
  baseQuery,
  reducerPath: "api",
  endpoints: () => ({}),
  tagTypes: ["PRODUCTS", "ORDERS", "SHOPS", "TRANSACTION", "TEMPLATE", "INVENTORY", "MENU", "SUBSCRIPTION_PLAN", "SUPPLY_REQUEST", "VENDORS", "VatConfig", "ServiceFeeConfig", "BRANCHES", "BANK_DETAILS", "ATTENDANCE", "DEPARTMENT", "LEAVE", "ACCOUNTING", "PAYROLL", "VENDOR_INVOICES", "PAID_INVOICES", "WHATSAPP_MESSAGES", "CURRENCY", "LOUNGE_MEMBERS", "LOUNGE_WALKINS", "LOUNGE_BOTTLES", "LOUNGE_APPLICATIONS", "LOUNGE_INVENTORY", "LOUNGE_DASHBOARD", "LOUNGE_PASSES", "LOUNGE_TABS", "LOUNGE_DESIGNATED", "PERFUME_CLIENTS"],
});

export default baseApi;
