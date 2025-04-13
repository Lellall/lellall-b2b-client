export const theme = {
    colors: {
      primary: "#ffffff", // Fixed typo from #fffff to #ffffff (white)
      secondary: "#F8F9FA", // Light gray background
      primaryFont: "#9197B3", // Muted blue-gray for text
      accent: "#0E5D37", // Dark green for buttons/links
      hover: "#c8e6c9", // Light green for hover states
      hoverFont: "#81c784", // Medium green for hover text
      active: "#05431E", // Very dark green for active states
      // New colors for ProviderCard
      borderDefault: "#D1D5DB", // Light gray for unselected card borders
      borderSelected: "#0E5D37", // Reuse accent for selected card borders
      backgroundDefault: "#F8F9FA", // Reuse secondary for unselected card background
      backgroundSelected: "#E8F5E9", // Slightly lighter green for selected card background
      providerText: "#05431E", // Reuse active for provider card text
    },
    breakpoints: {
      mobile: "768px",
    },
  };