import { baseApi } from "../baseApi"

// Define the expected payload type for the order endpoint
interface OrderPayload {
  status: string
  items: {
    menuItemId: string
    quantity: number
  }[]
}

interface OrderItem {
  menuItemId: string
  quantity: number
  name: string
  price: number
}

interface Order {
  id: string
  userId: string
  status: string
  orderItems: OrderItem[]
  createdAt: string
  updatedAt: string
}

const ordersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createOrder: builder.mutation({
      query: (orderPayload: OrderPayload) => ({
        url: "/orders",
        method: "POST",
        body: orderPayload,
      }),
      invalidatesTags: ["ORDERS"],
    }),
    getOrders: builder.query<Order[], void>({
      query: () => ({
        url: "/orders",
        method: "GET",
      }),
      // Optionally, you can provide tags for caching
      providesTags: ["ORDERS"],
    }),
    updateOrder: builder.mutation<Order, { orderId: string; payload: OrderPayload }>({
      query: ({ orderId, payload }) => ({
        url: `/orders/${orderId}`,
        method: "PUT",
        body: payload,
      }),
    }),
    deleteOrder: builder.mutation<void, string>({
      query: (orderId) => ({
        url: `/orders/${orderId}`,
        method: "DELETE",
      }),
      // Invalidate the ORDERS tag to refetch orders after deletion
      invalidatesTags: ["ORDERS"],
    }),
  }),
})

// Export the generated hooks
export const { useCreateOrderMutation, useGetOrdersQuery, useDeleteOrderMutation, useUpdateOrderMutation } = ordersApi
