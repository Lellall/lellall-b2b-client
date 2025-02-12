const config = {
  development: {
    BACKEND_URL: "https://api.dev.lellall.com/b2b-api",
  },
  production: {
    BACKEND_URL: "https://api.dev.lellall.com/b2b-api",
  },
}

const currentEnv = process.env.NODE_ENV || "development"

export const configUrl = config[currentEnv as "development" | "production"]

// export const { BACKEND_URL } = config[currentEnv]
// export const BACKEND_URL = (config as { [key: string]: { BACKEND_URL: string } })[currentEnv].BACKEND_URL;
