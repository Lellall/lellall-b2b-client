import axios from "axios";
import { configUrl } from "../../utils/config";

const CustomAxios = axios.create({
  baseURL: `${configUrl?.BACKEND_URL}/`,
  headers: {
    "Content-Type": "application/json",
  },
});

const endpointsRequiringToken = [''];
CustomAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token && endpointsRequiringToken.some((pattern) => config.url?.match(pattern))) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      config.headers.Authorization = "Bearer ";
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

async function refreshToken() {
  let refresh = localStorage.getItem("refresh_token");
  if (!refresh) refresh = "null";
  return CustomAxios.post("auth/refresh-token", {
    refreshToken: localStorage.getItem("refresh_token") || "null",
  }).catch(() => {
    window.location.href = "/login";
  });
}

CustomAxios.interceptors.response.use(
  (res) => {
    return res;
  },
  async (err) => {
    const originalConfig = err.config;

    // Check if the request URL is /auth/login
    if (originalConfig.url === "/auth/login" || originalConfig.url === "/auth/login") {
      return Promise.reject(err);
    }

    if (err.response) {
      // Access Token was expired
      if (err.response.status === 401 || (err.response.status === 403 && !originalConfig._retry)) {
        originalConfig._retry = true;
        try {
          const rs = await refreshToken();

          const { access_token } = rs?.data ?? null;
          localStorage.setItem("access_token", access_token);
          CustomAxios.defaults.headers.common.Authorization = `Bearer ${access_token}`;
          return await CustomAxios(originalConfig);
        } catch (_error) {
          if (_error.response && _error.response.data) {
            return Promise.reject(_error.response.data);
          }
          return Promise.reject(_error);
        }
      }
      if (err.response.status === 403 && err.response.data) {
        return Promise.reject(err.response.data);
      }
    }
    return Promise.reject(err);
  }
);

export default CustomAxios;