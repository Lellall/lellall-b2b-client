import { baseApi } from "../../api/baseApi";
import { toast } from "react-toastify";
import { ErrorHandler } from "@/utils/error-handler";

interface SubscriptionPlan {
    id: string;
    name: string;
    price: number;
    duration: number;
    description: string;
    billingInterval: "MONTHLY" | "YEARLY";
    trialDays: number;
    amount: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

interface CreateSubscriptionPlanDto {
    name: string;
    price: number;
    duration: number;
    description: string;
    billingInterval: "MONTHLY" | "YEARLY";
    trialDays: number;
    amount: number;
}

interface UpdateSubscriptionPlanDto {
    name?: string;
    price?: number;
    duration?: number;
    description?: string;
    billingInterval?: "MONTHLY" | "YEARLY";
    trialDays?: number;
    amount?: number;
    isActive?: boolean;
}

interface PaymentDto {
    email: string;
    amount: string;
    currency: string;
    plan: string;
    tx_ref?: string; // For Flutterwave
    reference?: string; // For Paystack
}

interface PaymentResponse {
    status: string;
    message: string;
    paymentLink: string;
}

interface VerifyPaymentResponse {
    status: string;
    message: string;
    user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: string;
        // Add other user fields as needed
    };
    subscription: {
        id: string;
        planId: string;
        status: "ACTIVE" | "PENDING_PAYMENT" | "CANCELLED";
        startDate: string;
        endDate: string;
        amount: number;
        // Add other subscription fields
    };
    accessToken?: string;
    refreshToken?: string;
}

export const subscriptionApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        createSubscriptionPlan: builder.mutation<
            SubscriptionPlan,
            CreateSubscriptionPlanDto
        >({
            query: (dto) => ({
                url: "/subscription-plans",
                method: "POST",
                body: dto,
                credentials: "include",
            }),
            invalidatesTags: ["SUBSCRIPTION_PLAN"],
            async onQueryStarted(_args, { queryFulfilled }) {
                try {
                    await queryFulfilled;
                    toast.success("Subscription plan created successfully", {
                        position: "top-right",
                    });
                } catch (err: any) {
                    ErrorHandler(err);
                    toast.error(
                        err?.error?.data?.message || "Failed to create subscription plan",
                        {
                            position: "top-right",
                        }
                    );
                    throw err;
                }
            },
        }),

        updateSubscriptionPlan: builder.mutation<
            SubscriptionPlan,
            { id: string; dto: UpdateSubscriptionPlanDto }
        >({
            query: ({ id, dto }) => ({
                url: `/subscription-plans/${id}`,
                method: "PATCH",
                body: dto,
                credentials: "include",
            }),
            invalidatesTags: ["SUBSCRIPTION_PLAN"],
            async onQueryStarted(_args, { queryFulfilled }) {
                try {
                    await queryFulfilled;
                    toast.success("Subscription plan updated successfully", {
                        position: "top-right",
                    });
                } catch (err: any) {
                    ErrorHandler(err);
                    toast.error(
                        err?.error?.data?.message || "Failed to update subscription plan",
                        {
                            position: "top-right",
                        }
                    );
                    throw err;
                }
            },
        }),

        deleteSubscriptionPlan: builder.mutation<void, string>({
            query: (id) => ({
                url: `/subscription-plans/${id}`,
                method: "DELETE",
                credentials: "include",
            }),
            invalidatesTags: ["SUBSCRIPTION_PLAN"],
            async onQueryStarted(_args, { queryFulfilled }) {
                try {
                    await queryFulfilled;
                    toast.success("Subscription plan deleted successfully", {
                        position: "top-right",
                    });
                } catch (err: any) {
                    ErrorHandler(err);
                    toast.error(
                        err?.error?.data?.message || "Failed to delete subscription plan",
                        {
                            position: "top-right",
                        }
                    );
                    throw err;
                }
            },
        }),

        getAllSubscriptionPlans: builder.query<SubscriptionPlan[], void>({
            query: () => ({
                url: "/subscription-plans",
                method: "GET",
                credentials: "include",
            }),
            providesTags: ["SUBSCRIPTION_PLAN"],
            async onQueryStarted(_args, { queryFulfilled }) {
                try {
                    await queryFulfilled;
                } catch (err: any) {
                    ErrorHandler(err);
                    toast.error(
                        err?.error?.data?.message || "Failed to fetch subscription plans",
                        {
                            position: "top-right",
                        }
                    );
                    throw err;
                }
            },
        }),

        getSubscriptionPlanById: builder.query<SubscriptionPlan, string>({
            query: (id) => ({
                url: `/subscription-plans/${id}`,
                method: "GET",
                credentials: "include",
            }),
            providesTags: ["SUBSCRIPTION_PLAN"],
            async onQueryStarted(_args, { queryFulfilled }) {
                try {
                    await queryFulfilled;
                } catch (err: any) {
                    ErrorHandler(err);
                    toast.error(
                        err?.error?.data?.message || "Failed to fetch subscription plan",
                        {
                            position: "top-right",
                        }
                    );
                    throw err;
                }
            },
        }),

        initiateSubscriptionPayment: builder.mutation<
        PaymentResponse,
        { restaurantId: string; dto: PaymentDto; provider: "paystack" | "flutterwave"; subdomain?: string } // Add optional subdomain
      >({
        query: ({ restaurantId, dto, provider, subdomain }) => ({
          url: `/subscription-plans/pay/${restaurantId}?provider=${provider}${subdomain ? `&subdomain=${subdomain}` : ''}`, // Append subdomain if provided
          method: "POST",
          body: dto,
          credentials: "include",
        }),
        async onQueryStarted(_args, { queryFulfilled }) {
          try {
            const { data } = await queryFulfilled;
            toast.success("Payment initiated successfully", {
              position: "top-right",
            });
            if (data.paymentLink) {
              window.location.href = data.paymentLink;
            }
          } catch (err: any) {
            ErrorHandler(err);
            toast.error(err?.error?.data?.message || "Failed to initiate payment", {
              position: "top-right",
            });
            throw err;
          }
        },
      }),

        verifyPayment: builder.mutation<
            VerifyPaymentResponse,
            { reference: string; provider: "paystack" | "flutterwave" }
        >({
            query: ({ reference, provider }) => ({
                url: `/subscription-plans/verify/${reference}?provider=${provider}`,
                method: "POST",
                credentials: "include",
            }),
            async onQueryStarted(_args, { queryFulfilled }) {
                try {
                    await queryFulfilled;
                    toast.success("Payment verified successfully", {
                        position: "top-right",
                    });
                } catch (err: any) {
                    ErrorHandler(err);
                    toast.error(err?.error?.data?.message || "Failed to verify payment", {
                        position: "top-right",
                    });
                    throw err;
                }
            },
        }),
    }),
});

export const {
    useCreateSubscriptionPlanMutation,
    useUpdateSubscriptionPlanMutation,
    useDeleteSubscriptionPlanMutation,
    useGetAllSubscriptionPlansQuery,
    useGetSubscriptionPlanByIdQuery,
    useInitiateSubscriptionPaymentMutation,
    useVerifyPaymentMutation,
} = subscriptionApi;

export default subscriptionApi;