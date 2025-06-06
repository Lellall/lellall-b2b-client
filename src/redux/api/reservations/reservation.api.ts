import { toast } from "react-toastify"
import { baseApi } from "../baseApi"

const reservationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    postReservation: builder.mutation<Reservation, void>({
      query: (data) => ({
        url: "/reservations",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["RESERVATIONS"],
      async onQueryStarted(_args, { queryFulfilled: qf }) {
        qf.then(() => {
          toast.success("Reserved Successfully")
        }).catch((err) => {
          // Errorhandler(err)
          const msg = err.message || "Failed to reserved"
          toast.error(msg)
        })
      },
    }),
    reservations: builder.query<Reservation[], void>({
      query: () => ({
        url: "/reservations",
      }),
      providesTags: ["RESERVATIONS"],
    }),
    reservation: builder.query<Reservation[], { id: string }>({
      query: ({ id }) => ({
        url: `/reservations/${id}`,
      }),
      providesTags: ["RESERVATIONS"],
    }),
    updateReservation: builder.query<Reservation, RequestUpdate>({
      query: ({ id, ...rest }) => ({
        url: `/reservations/${id}`,
        method: "PUT",
        body: rest,
      }),
      providesTags: ["RESERVATIONS"],
    }),
    deleteReservation: builder.query<Reservation, { id: string }>({
      query: ({ id }) => ({
        url: `/reservations/${id}`,
        method: "DELETE",
      }),
      providesTags: ["RESERVATIONS"],
    }),
  }),
})

export const {
  usePostReservationMutation,
  useDeleteReservationQuery,
  useUpdateReservationQuery,
  useReservationQuery,
  useReservationsQuery,
} = reservationApi

export interface Reservation {
  id: string
  tableNumber: string
  status: string
  reservationDate: string
  reservationTime: ReservationTime
  depositFee: number
  customerTitle: string
  customerFirstName: string
  customerLastName: string
  customerEmail: string
  customerPhone: string
  createdAt: string
  updatedAt: string
  createdBy: string
}
interface RequestUpdate extends Reservation {
  userId?: string
}

export interface ReservationTime {
  hour: number
  minute: number
  second: number
  nano: number
}
