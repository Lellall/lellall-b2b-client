const config = {
  development: {
    // BACKEND_URL: "https://api-b2b-prod.lellall.com/",
    BACKEND_URL: "http://localhost:3333/",
  },
  production: {
    // BACKEND_URL: "http://localhost:3333/",
    BACKEND_URL: "https://api-b2b-prod.lellall.com/",
  },
}

const currentEnv = process.env.NODE_ENV || "development"

export const configUrl = config[currentEnv as "development" | "production"]

// Utility function to extract subdomain from URL
export const getSubdomainFromUrl = (): string | null => {
  const host = window.location.hostname; // Use hostname instead of href to avoid port issues
  const parts = host.split(".");
  
  // Handle cases like "greenfork-branch2.localhost" or "yax.localhost"
  if (parts.length > 1) {
    const subdomain = parts[0];
    // Skip if it's 'www' or empty
    if (subdomain && subdomain !== 'www') {
      return subdomain;
    }
  }
  
  return null;
};

// export const { BACKEND_URL } = config[currentEnv]
// export const BACKEND_URL = (config as { [key: string]: { BACKEND_URL: string } })[currentEnv].BACKEND_URL;
// https://youtu.be/B9hsWOCXb_o?si=x8HKraZJC2R0WtAW