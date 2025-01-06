// @ts-nocheck
import { createApi } from "@reduxjs/toolkit/query/react"
import CustomAxios from "./customAxios"

interface CustomAxiosProps {
  url: string
  method?: "GET" | "POST" | "PATCH" | "DELETE" | "PUT"
  params?: any
  body?: any
}

const baseQuery = async ({ url, method, body, params }: CustomAxiosProps) => {
  try {
    const result = await CustomAxios({ url, method, params, data: body })
    return { data: result.data }
  } catch (axiosError) {
    let err = axiosError
    if (axiosError.response) {
      err = {
        status: axiosError.response.status,
        data: axiosError.response.data,
      }
    }
    return {
      error: err,
    }
  }
}

export const baseApi = createApi({
  baseQuery,
  reducerPath: "api",
  endpoints: () => ({}),
  tagTypes: ["PRODUCTS", "ORDERS", "SHOPS", "TRANSACTION", "TEMPLATE", "INVENTORY"],
})

export const { useGetQuery, usePostMutation } = baseApi as any
