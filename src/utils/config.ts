const config = {
  development: {
    BACKEND_URL: "https://137.184.8.142/",
    // BACKEND_URL: "http://localhost:3333/",
  },
  production: {
    BACKEND_URL: "https://137.184.8.142/",
    // BACKEND_URL: "http://localhost:3333/",
  },
}

const currentEnv = process.env.NODE_ENV || "development"

export const configUrl = config[currentEnv as "development" | "production"]

// export const { BACKEND_URL } = config[currentEnv]
// export const BACKEND_URL = (config as { [key: string]: { BACKEND_URL: string } })[currentEnv].BACKEND_URL;
