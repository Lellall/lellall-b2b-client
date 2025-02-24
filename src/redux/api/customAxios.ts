/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-underscore-dangle */
// @ts-nocheck
import axios from "axios"
import { configUrl } from "../../utils/config"

const CustomAxios = axios.create({
  baseURL: `${configUrl?.BACKEND_URL}/`,
  headers: {
    "Content-Type": "application/json",
  },
})

const endpointsRequiringToken = [
  "/orders",
  "/template",
  "/transactions",
  "inventory",
  "/shops",
  "/markets",
  "/roles",
  "/privileges",
  "/order-statistic",
  "invoices",
  "^/restaurants/[a-fA-F0-9-]+$/",
  "^/reservations",
  /^\/products\/[a-fA-F0-9-]+$/,
]

// Add endpoints that should NOT have an Authorization header
const endpointsWithoutToken = ["/auth/login", "/auth/register", "/auth/refresh-token"]

CustomAxios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token")

    const requiresToken = endpointsRequiringToken.some((pattern) => config.url?.match(pattern))
    const skipToken = endpointsWithoutToken.some((endpoint) => config.url?.includes(endpoint))

    if (token && requiresToken && !skipToken) {
      config.headers.Authorization = `Bearer ${token}`
    } else {
      delete config.headers.Authorization // Explicitly remove the header
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

async function refreshToken() {
  let refresh = localStorage.getItem("refresh_token")
  if (!refresh) refresh = "null"
  return CustomAxios.post("auth/refresh-token", {
    refreshToken: localStorage.getItem("refresh_token") || "null",
    // role: USER_ROLE,
    role: "user",
  }).catch(() => {
    window.location.href = "/login"
  })
}

CustomAxios.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalConfig = err.config
    // if (err.response) {
    //   if ((err.response.status === 401 || err.response.status === 403) && !originalConfig._retry) {
    //     originalConfig._retry = true
    //     try {
    //       const rs = await refreshToken()
    //       const { access_token } = rs?.data ?? null
    //       if (access_token) {
    //         localStorage.setItem("access_token", access_token)
    //         CustomAxios.defaults.headers.common.Authorization = `Bearer ${access_token}`
    //         return await CustomAxios(originalConfig)
    //       }
    //     } catch (_error) {
    //       return Promise.reject(_error)
    //     }
    //   }
    //   if (err.response.status === 403 && err.response.data) {
    //     return Promise.reject(err.response.data)
    //   }
    // }
    return Promise.reject(err)
  }
)

export default CustomAxios
