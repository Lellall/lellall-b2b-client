import React, { createContext, useContext, ReactNode } from "react";
import { useSelector } from "react-redux";
import { useGetRestaurantCurrencyQuery } from "@/redux/api/restaurant/restaurant.api";
import { selectAuth } from "@/redux/api/auth/auth.slice";

interface CurrencyContextType {
    currencyCode: string;
    currencySymbol: string;
    isLoading: boolean;
    formatCurrency: (amount: number | string) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { subdomain, isAuthenticated } = useSelector(selectAuth);
 
    const { data, isLoading } = useGetRestaurantCurrencyQuery(subdomain, {
        skip: !isAuthenticated || !subdomain || subdomain === "admin" || subdomain === "www",
        refetchOnMountOrArgChange: true,
    });

    const currencyCode = data?.currencyCode || "NGN";
    const currencySymbol = data?.currencySymbol || "₦";

    const formatCurrency = (amount: number | string): string => {
        const num = typeof amount === 'string' ? parseFloat(amount.replace(/[^\d.-]/g, '')) : amount;
        const safeNum = isNaN(num) || num === null || num === undefined ? 0 : num;
        return `${currencySymbol}${safeNum.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })}`;
    };

    return (
        <CurrencyContext.Provider value={{ currencyCode, currencySymbol, isLoading, formatCurrency }}>
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrency = (): CurrencyContextType => {
    const context = useContext(CurrencyContext);
    if (context === undefined) {
        // Return a default fallback if used outside of provider
        return {
            currencyCode: "NGN",
            currencySymbol: "₦",
            isLoading: false,
            formatCurrency: (amount: number | string): string => {
                const num = typeof amount === 'string' ? parseFloat(amount.replace(/[^\d.-]/g, '')) : amount;
                const safeNum = isNaN(num) || num === null || num === undefined ? 0 : num;
                return `₦${safeNum.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                })}`;
            },
        };
    }
    return context;
};
