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
  "bank-details"
];

const endpointsWithoutToken = ["/auth/login", "/auth/register", "/auth/refresh-token"];

CustomAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    const requiresToken = endpointsRequiringToken.some((pattern) => new RegExp(pattern).test(config.url || ""));
    const skipToken = endpointsWithoutToken.some((endpoint) => config.url?.includes(endpoint));

    if (token && requiresToken && !skipToken) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
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
