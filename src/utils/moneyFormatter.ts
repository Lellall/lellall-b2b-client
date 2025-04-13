export const moneyFormatter = (amount: number) => {
    if (isNaN(amount)) return "₦0.00";
  
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 2,
    }).format(amount);
  };
  