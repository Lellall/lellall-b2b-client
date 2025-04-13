const config = {
  development: {
    BACKEND_URL: "http://localhost:3333/",
    // BACKEND_URL: "https://api-b2b-dev.lellall.com/",
  },
  production: {
    BACKEND_URL: "http://localhost:3333/",
    // BACKEND_URL: "https://api-b2b-dev.lellall.com/",
  },
}

const currentEnv = process.env.NODE_ENV || "development"

export const configUrl = config[currentEnv as "development" | "production"]

// export const { BACKEND_URL } = config[currentEnv]
// export const BACKEND_URL = (config as { [key: string]: { BACKEND_URL: string } })[currentEnv].BACKEND_URL;
