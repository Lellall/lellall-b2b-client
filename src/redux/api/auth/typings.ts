export interface RefreshRequest {
  refreshToken: string
  role: string
}

export interface User {
  id: string
  username: string
  firstName: string
  lastName: string
  role: string
  isEmailVerified: boolean
  registrationSource: string
  phoneNumber: string
  address: {
    streetName: string
    houseNumber: string
    apartmentName: string
    estate: string
    poBox: string
  }
  isPhoneNumberVerified: boolean
  deviceId: string
  shopIds: string[]
  privileges: any | []
}

export interface LoginResponse {
  refreshToken: string
  accessToken: string
  token_type: string
  isAuthenticated: boolean
  user: User | null
  isAdmin: boolean
}

export interface LoginRequest {
  email: string
  password: string
  role?: string
}
