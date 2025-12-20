import axios from "axios";
import { configUrl } from "../../utils/config";

const CustomAxios = axios.create({
  baseURL: `${configUrl?.BACKEND_URL}/`,
  headers: {
    "Content-Type": "application/json",
  },
});

const endpointsRequiringToken = [
  "/orders",
  "^/subscription-plans",
  "^/subscription-plans/pay/[a-fA-F0-9-]{36}$",
  "/template",
  "/transactions",
  "/inventory",
  "/shops",
  "/markets",
  "/roles",
  "/menus/",
  "/privileges",
  "/order-statistic",
  "/order/[a-fA-F0-9-]+$",
  "/invoices",
  "/orders/[a-fA-F0-9-]+$",
  "/status",
  "vendor",
  "request",
  "reservations",
  "^/restaurants/[a-fA-F0-9-]+$",
  "^/restaurants/[^/]+/service-fee$",
  "^/restaurants/branches/parent/[a-fA-F0-9-]+$",
  "^/restaurants/branches/[a-fA-F0-9-]{8}-[a-fA-F0-9-]{4}-[a-fA-F0-9-]{4}-[a-fA-F0-9-]{4}-[a-fA-F0-9-]{12}$",
  "^/restaurants/branches/[a-fA-F0-9-]+$",
  "^restaurants/branches/[a-fA-F0-9-]+$",
  "restaurants/branches",
  "^/supply-request/[a-fA-F0-9-]+$",
  "^/request/[a-fA-F0-9-]+$",
  "^/products/[a-fA-F0-9-]+$",
  "users",
  "^/user/[a-fA-F0-9-]+$",
  "create-user",
  "user-stats",
  "units",
  "^/restaurants/user/[a-fA-F0-9-]{36}$",
  "^/subscription-plans/pay/[a-fA-F0-9-]{36}$",
  "bank-details",
  "^/ai-reporting/[a-fA-F0-9-]+/predict-revenue",
  "^/ai-reporting/[a-fA-F0-9-]+/waiter-performance",
  "^/ai-reporting/[a-fA-F0-9-]+/top-performers",
  "^/ai-reporting/[a-fA-F0-9-]+/insights",
  "^/ai-reporting/[a-fA-F0-9-]+/seasonal-trends",
  "/ai-reporting/compare-restaurants",
  "^/attendance",
  "^/attendance/list/[a-fA-F0-9-]+$",
  "^/attendance/staff/[a-fA-F0-9-]+/all$",
  "^/attendance/staff/[a-fA-F0-9-]+/status/",
  "^/attendance/staff/[a-fA-F0-9-]+/attendance",
  "^/attendance/staff/[a-fA-F0-9-]+/leaves",
  "^/attendance/record$",
  "^/attendance/check-in-out$",
  "^/attendance/[a-fA-F0-9-]+/status$",
  "^/attendance/departments",
  "^/attendance/staff/link-department$",
  "^/attendance/leave/requests",
  "^/attendance/salary",
  "^attendance/salary",
  "^/accounting",
  "^/payroll",
  "^payroll",
  "^[^/]+/vendor-invoices",
  "^webhooks/whatsapp"
];

const endpointsWithoutToken = ["/auth/login", "/auth/register", "/auth/refresh-token"];

CustomAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    const url = config.url || "";
    // Normalize URL - ensure it starts with / for pattern matching
    const normalizedUrl = url.startsWith('/') ? url : `/${url}`;
    const requiresToken = endpointsRequiringToken.some((pattern) => {
      const regex = new RegExp(pattern);
      // Test normalized URL, original URL, and URL with leading slash
      return regex.test(normalizedUrl) || regex.test(url) || regex.test(`/${url}`);
    });
    const skipToken = endpointsWithoutToken.some((endpoint) => url.includes(endpoint));

    if (token && requiresToken && !skipToken) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }

    // Debug logging for payroll and salary endpoints
    if (url.includes('payroll') || url.includes('salary')) {
      console.log(`${url.includes('payroll') ? 'Payroll' : 'Salary'} Request:`, {
        url,
        hasToken: !!token,
        requiresToken,
        skipToken,
        willSendToken: !!(token && requiresToken && !skipToken),
        matchedPattern: endpointsRequiringToken.find((pattern) => new RegExp(pattern).test(url))
      });
    }

    // Debug logging for branches endpoints
    if (url.includes('branches')) {
      console.log('Branches Request:', {
        url,
        normalizedUrl,
        hasToken: !!token,
        requiresToken,
        skipToken,
        willSendToken: !!(token && requiresToken && !skipToken),
        matchedPattern: endpointsRequiringToken.find((pattern) => {
          const regex = new RegExp(pattern);
          return regex.test(normalizedUrl) || regex.test(url) || regex.test(`/${url}`);
        })
      });
    }

    // If FormData, don't set Content-Type - let browser set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

async function refreshToken() {
  const refreshToken = localStorage.getItem("refresh_token") || "null";

  try {
    const response = await CustomAxios.post("auth/refresh", { refreshToken });
    return response.data;
  } catch (error) {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    throw error;
  }
}

CustomAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalConfig = error.config;

    if (error.response) {
      if ((error.response.status === 401 || error.response.status === 403) && !originalConfig._retry) {
        originalConfig._retry = true;
        try {
          const data = await refreshToken();
          const newToken = data;
          if (newToken) {
            localStorage.setItem("access_token", newToken);
            CustomAxios.defaults.headers.common.Authorization = `Bearer ${newToken}`;
            return CustomAxios(originalConfig);
          }
        } catch (_error) {
          return Promise.reject(_error);
        }
      }

      if (error.response.status === 403 && error.response.data) {
        return Promise.reject(error.response.data);
      }
    }

    return Promise.reject(error);
  }
);

export default CustomAxios;
